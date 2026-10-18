#!/bin/zsh
# The ProposalSpace backup copy: ≤ 10 MB per file (docs/10-submission.md). 720p H.264 two-pass at 300k video + 64k AAC,
# which came to 8.66 MB on the 3:15 v4 cut and was visually close to the 1080p source at 640 px (tested 2026-10-18;
# HEVC slow was dropped: over an hour of 6-core encode for a backup).
#   tools/backup.sh out/<master>.mp4   →  out/<master>_backup.mp4 (fails loudly if it's over 10 MB)
set -e
IN=${1:?master mp4}; OUT=${IN:r}_backup.mp4; LOG=${IN:r}_backup_pass
ffmpeg -v error -y -i $IN -vf scale=1280:-2 -c:v libx264 -preset slow -b:v 300k -pass 1 -passlogfile $LOG -an -f mp4 /dev/null
ffmpeg -v error -y -i $IN -vf scale=1280:-2 -c:v libx264 -preset slow -b:v 300k -pass 2 -passlogfile $LOG -pix_fmt yuv420p \
  -c:a aac -b:a 64k -movflags +faststart $OUT
rm -f $LOG*
SIZE=$(stat -f %z $OUT); echo "$OUT  $((SIZE / 1048576)).$(( (SIZE % 1048576) * 100 / 1048576 )) MB"
[ $SIZE -le 10000000 ] || { echo "OVER 10 MB: lower -b:v"; exit 1; }
