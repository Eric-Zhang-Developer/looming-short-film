#!/bin/zsh
# Build the next master from the last one: re-render only the spans that changed, stream-copy the rest.
#   tools/assemble.sh <old.mp4> <new.mp4> <spec>       spec lines, in output order:
#     old <a> <b>    copy [a, b) of the OLD master (its times; a and b keyframes in it, or its start/end)
#     new <a> <b>    render [a, b) of the CURRENT timeline (whole seconds)
#   WORKERS=2 renders two frames at once (one Chrome, two pages; watch memory). Commands in the spec loops read
#   /dev/null, not the spec: ffmpeg reads stdin by default and would swallow the remaining spec lines.
#   PARTS_ONLY=1 renders the new spans and stops (they're kept in out/parts/, so a later run reuses them).
# Works across a timeline shift: shots run on local time, so a shot that moved keeps its frames and only moves.
# The old master is concat'd closed-GOP x264, cut exactly at its IDR packets by the segment muxer (see splice.sh).
set -e
OLD=${1:?old master}; NEW=${2:?new master}; SPEC=${3:?spec}; cd ${0:A:h}/..
DUR=$(node -e "import('./src/timeline.ts').then(m=>console.log(m.DURATION))")
OLD_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $OLD | awk '{printf "%d", $1+0.5}')
KEYS=$(ffprobe -v error -select_streams v -skip_frame nokey -show_entries frame=pts_time -of default=nw=1:nk=1 $OLD)
mkdir -p out/parts; rm -rf out/assemble; mkdir -p out/assemble
CUTS=()
while read -r kind a b; do
  [ -z "$kind" ] && continue
  if [ $kind = new ]; then
    p=out/parts/new_${a}_${b}.mp4; [ -s $p ] && { echo "== new $a:$b  kept"; continue; }
    echo "== new $a:$b  $(date +%H:%M)"; rm -rf out/frames; mkdir -p out/frames
    for try in 1 2 3; do
      node render.mjs --page=index.html --frames --range=$a:$b --workers=${WORKERS:-1} < /dev/null 2>&1 | grep -E 'ms/frame|Error' | tail -2 || true
      [ $(ls out/frames | grep -c jpg) -ge $(((b-a)*24)) ] && break
      [ $try = 3 ] && { echo "span $a:$b incomplete after 3 tries"; exit 1; }
    done
    ffmpeg -nostdin -v error -y -framerate 24 -start_number $((a*24)) -i out/frames/%06d.jpg -frames:v $(((b-a)*24)) -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p $p.tmp.mp4
    mv $p.tmp.mp4 $p; rm -f out/frames/*.jpg   # a part only counts as kept once it's whole
  else
    for t in $a $b; do
      [ $t = 0 ] || [ $t = $OLD_DUR ] || echo "$KEYS" | grep -qx "$t.000000" || { echo "$t s is not a keyframe in $OLD"; exit 1; }
      [ $t = 0 ] || [ $t = $OLD_DUR ] || CUTS+=$t
    done
  fi
done < $SPEC
[ -n "$PARTS_ONLY" ] && { echo "PARTS DONE"; ls -la out/parts; exit 0; }
CUTS=(${(nu)CUTS})                                  # sorted, unique: the old master's segment boundaries
EDGES=(0 $CUTS $OLD_DUR)
[ ${#CUTS} -gt 0 ] && ffmpeg -v error -y -i $OLD -map 0:v -c copy -f segment -segment_times ${(j:,:)CUTS} -reset_timestamps 1 out/assemble/s%03d.mp4
[ ${#CUTS} -eq 0 ] && ffmpeg -v error -y -i $OLD -map 0:v -c copy out/assemble/s000.mp4
: > out/assemble/list.txt
while read -r kind a b; do
  [ -z "$kind" ] && continue
  if [ $kind = new ]; then echo "file '../parts/new_${a}_${b}.mp4'" >> out/assemble/list.txt
  else
    i=${EDGES[(i)$a]}; j=${EDGES[(i)$b]}             # 1-based positions; segment k covers EDGES[k]..EDGES[k+1]
    for ((k = i; k < j; k++)); do echo "file 's$(printf %03d $((k-1))).mp4'" >> out/assemble/list.txt; done
  fi
done < $SPEC
ffmpeg -v error -y -f concat -safe 0 -i out/assemble/list.txt -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/assemble/master.mp4
N=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of default=nw=1:nk=1 out/assemble/master.mp4)
[ $N = $((DUR*24)) ] || { echo "assembled master has $N frames, want $((DUR*24)); nothing written"; exit 1; }
mv out/assemble/master.mp4 $NEW
ffmpeg -v error -y -i $NEW -vf scale=1280:-2 -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart ${NEW:r}_720p.mp4
rm -rf out/assemble; echo "DONE $N frames"; ls -la ${NEW:r}*.mp4
