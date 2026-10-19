#!/bin/zsh
# Re-render one span of a finished master and splice it in by stream copy, instead of re-rendering the film.
#   tools/splice.sh <a> <b> [master=out/looming_final.mp4]   (a, b: seconds; both must be keyframes in the master)
# The master is concat'd 30 s x264 chunks (closed GOPs), so its keyframes are IDR and cut cleanly with -c copy.
# The span is encoded with render_film.sh's settings; the mix is remuxed so the audio is untouched.
set -e
A=${1:?a}; B=${2:?b}; M=${3:-out/looming_final.mp4}; cd ${0:A:h}/..
KEYS=$(ffprobe -v error -select_streams v -skip_frame nokey -show_entries frame=pts_time -of default=nw=1:nk=1 $M)
for t in $A $B; do echo "$KEYS" | grep -qx "$t.000000" || { echo "$t s is not a keyframe in $M"; exit 1; }; done
DUR=$(node -e "import('./src/timeline.js').then(m=>console.log(m.DURATION))")
rm -rf out/frames out/splice; mkdir -p out/frames out/splice
for try in 1 2 3; do
  node render.mjs --page=index.html --frames --range=$A:$B --workers=1 2>&1 | grep -E 'ms/frame|Error' | tail -2 || true
  [ $(ls out/frames | grep -c jpg) -ge $(((B-A)*24)) ] && break
  [ $try = 3 ] && { echo "span incomplete after 3 tries"; exit 1; }
done
ffmpeg -v error -y -framerate 24 -start_number $((A*24)) -i out/frames/%06d.jpg -frames:v $(((B-A)*24)) -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p out/splice/b.mp4
# The segment muxer splits at the IDR packet itself; -t/-ss with -c copy keep B-frames that straddle the cut.
ffmpeg -v error -y -i $M -map 0:v -c copy -f segment -segment_times $A,$B -reset_timestamps 1 out/splice/s%d.mp4
printf "file 's0.mp4'\nfile 'b.mp4'\nfile 's2.mp4'\n" > out/splice/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/splice/list.txt -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/splice/master.mp4
N=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of default=nw=1:nk=1 out/splice/master.mp4)
[ $N = $((DUR*24)) ] || { echo "spliced master has $N frames, want $((DUR*24)); master untouched"; exit 1; }
mv $M ${M:r}_pre_splice.mp4 && mv out/splice/master.mp4 $M
ffmpeg -v error -y -i $M -vf scale=1280:-2 -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart ${M:r}_720p.mp4
rm -rf out/frames/*.jpg out/splice; echo "DONE $N frames"; ls -la ${M:r}*.mp4
