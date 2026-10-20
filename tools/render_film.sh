#!/bin/zsh
# Chunked full-film render, for a laptop whose free disk can't hold a whole frame set (~1.3 GB per 3 min):
# cut frozen art, mix audio, render 30 s chunks (encode, then delete their frames), concat, 720p copy.
#   tools/render_film.sh <name> [crf=18]   →  out/<name>.mp4, out/<name>_720p.mp4
#   RESUME=1 tools/render_film.sh <name>   keeps finished chunks and frames from a crashed run of the SAME cut.
# A chunk whose frames come up short (a Chrome crash) is retried twice; render.ts --frames skips frames on disk.
set -e
NAME=${1:?name}; CRF=${2:-18}; cd ${0:A:h}/..
for f in assets/cut/*.boxes.json; do k=$(basename $f .boxes.json); [ -f assets/frozen/$k.png ] && node tools/cut.ts --in=assets/frozen/$k.png --boxes=$f >/dev/null; done
node tools/mix.ts | tail -1
DUR=$(node -e "import('./src/timeline.ts').then(m=>console.log(m.DURATION))")
[ -n "$RESUME" ] || rm -rf out/frames out/chunks; mkdir -p out/chunks out/frames; : > out/chunks/list.txt
a=0
while [ $a -lt $DUR ]; do
  b=$((a+30)); [ $b -gt $DUR ] && b=$DUR
  f0=$((a*24)); n=$(((b-a)*24)); out=out/chunks/$(printf %03d $a).mp4
  if [ -n "$RESUME" ] && [ -s $out ]; then echo "== chunk $a:$b  kept"; echo "file '$(basename $out)'" >> out/chunks/list.txt; a=$b; continue; fi
  echo "== chunk $a:$b  free $(df -g / | awk 'NR==2{print $4}') GB  $(date +%H:%M)"
  for try in 1 2 3; do
    node render.ts --page=index.html --frames --range=$a:$b --workers=1 2>&1 | grep -E 'ms/frame|Error' | tail -2 || true
    [ $(ls out/frames | grep -c jpg) -ge $n ] && break
    [ $try = 3 ] && { echo "chunk $a incomplete after 3 tries"; exit 1; }
    echo "   chunk $a short ($(ls out/frames | grep -c jpg)/$n frames), retry $try"
  done
  ffmpeg -v error -y -framerate 24 -start_number $f0 -i out/frames/%06d.jpg -frames:v $n -c:v libx264 -crf $CRF -preset slow -pix_fmt yuv420p $out
  rm -f out/frames/*.jpg; echo "file '$(basename $out)'" >> out/chunks/list.txt; a=$b
done
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/$NAME.mp4
ffmpeg -v error -y -i out/$NAME.mp4 -vf scale=1280:-2 -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart out/${NAME}_720p.mp4
rm -rf out/chunks; echo "DONE"; ls -la out/$NAME*.mp4
