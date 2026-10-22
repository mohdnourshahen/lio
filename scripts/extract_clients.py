"""Pull the inline client logo SVGs out of the legacy homepage into files."""
import os, re, sys
from bs4 import BeautifulSoup

src, out = sys.argv[1], sys.argv[2]
soup = BeautifulSoup(open(src).read(), 'html.parser')
os.makedirs(out, exist_ok=True)
i = 0
for cell in soup.select('#clients .client-cell'):
    svg = cell.find('svg')
    if svg is None:  # empty filler cell in the legacy grid
        continue
    i += 1
    for a in ('class', 'id', 'data-name'):
        svg.attrs.pop(a, None)
    svg['xmlns'] = 'http://www.w3.org/2000/svg'
    s = str(svg)
    # html.parser lowercases attributes; standalone SVG is case-sensitive XML
    for name in ('viewBox', 'preserveAspectRatio', 'gradientUnits', 'gradientTransform', 'clipPathUnits'):
        s = s.replace(name.lower() + '=', name + '=')
    if 'xlink:' in s and 'xmlns:xlink' not in s:
        s = s.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ', 1)
    open(os.path.join(out, f'{i:02d}.svg'), 'w').write(s)
print(i)
