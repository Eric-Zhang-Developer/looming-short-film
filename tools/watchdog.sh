#!/bin/zsh
# Overnight guard: kill headless Chrome + renders when disk or swap gets dangerous, then exit (wakes the orchestrator).
#   tools/watchdog.sh [min_free_gb=3] [max_swap_mb=12000] [min_mem_free_pct=15]   → logs to out/watchdog.log
# Swap alone isn't a trip: macOS keeps swap allocated long after pressure passes (12 GB used at 42% memory free).
MIN=${1:-3}; MAX=${2:-12000}; MEM=${3:-15}; LOG=${0:A:h}/../out/watchdog.log; n=0
while true; do
  free_gb=$(df -g / | awk 'NR==2{print $4}')
  swap_mb=$(sysctl -n vm.swapusage | sed -E 's/.*used = ([0-9.]+)M.*/\1/' | cut -d. -f1)
  memfree=$(memory_pressure -Q 2>/dev/null | grep -oE '[0-9]+%' | tr -d %)
  line="$(date +%H:%M:%S) disk ${free_gb}G free · swap ${swap_mb}M · mem free ${memfree}% · headless $(pgrep -f -- '--headless' | wc -l | tr -d ' ')"
  (( n++ % 15 == 0 )) && echo "$line" >> $LOG
  if (( free_gb < MIN || (swap_mb > MAX && memfree < MEM) )); then
    pkill -f -- '--headless'; pkill -f 'render.mjs|measure.mjs'
    echo "TRIP $line: killed headless Chrome and renders" | tee -a $LOG; exit 1
  fi
  (( memfree < 8 )) && echo "WARN $line" >> $LOG
  sleep 20
done
