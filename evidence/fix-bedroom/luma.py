# Mean luma (ffmpeg signalstats YAVG, 0-255) of each cell of a render.mjs contact sheet, and their mean.
# usage: python3 luma.py sheet.jpg cols n [gap=8]   (cells are 16:9; render.mjs puts 8 px black gaps between cells)
import subprocess, sys, re
path, cols, n = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); gap = int(sys.argv[4]) if len(sys.argv) > 4 else 8
W = int(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=width', '-of', 'csv=p=0', path]))
w = (W - (cols - 1) * gap) // cols; h = round(w * 9 / 16)
vals = []
for i in range(n):
    x, y = (i % cols) * (w + gap), (i // cols) * (h + gap)
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'crop={w}:{h}:{x}:{y},signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], capture_output=True, text=True).stdout
    vals.append(float(re.search(r'YAVG=([\d.]+)', out).group(1)))
print(' '.join(f'{v:.2f}' for v in vals))
print(f'mean {sum(vals) / len(vals):.2f} over {n} cells')
