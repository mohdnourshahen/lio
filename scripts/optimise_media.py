"""Turn the raw images pulled out of legacy/*.html into responsive AVIF + WebP.

Usage: python3 scripts/optimise_media.py <raw-dir> public/media
Writes <id>-<width>.avif/.webp and public/media/media.json (intrinsic size,
available widths and an average colour used as the loading placeholder).
"""
import json, os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps

# 1440 fills a laptop at 1x and a phone at 3x; the source's own width (up to 2560) is always offered
WIDTHS = (960, 1440, 1920, 2560)
SKIP = {'8d44b0c738', '48f86927eb'}  # rasters embedded inside client SVG logos


def work(args):
    src, out = args
    iid = os.path.basename(src).split('.')[0]
    im = ImageOps.exif_transpose(Image.open(src))
    has_alpha = im.mode in ('RGBA', 'LA', 'P') and 'transparency' in im.info or im.mode in ('RGBA', 'LA')
    im = im.convert('RGBA' if has_alpha else 'RGB')
    w, h = im.size
    widths = sorted({min(x, w) for x in WIDTHS} | ({w} if w < 2560 else set()))
    for tw in widths:
        r = im if tw == w else im.resize((tw, round(h * tw / w)), Image.LANCZOS)
        r.save(os.path.join(out, f'{iid}-{tw}.webp'), 'WEBP', quality=90, method=6)
        r.save(os.path.join(out, f'{iid}-{tw}.avif'), 'AVIF', quality=74, speed=4)
    avg = im.convert('RGB').resize((1, 1), Image.BOX).getpixel((0, 0))
    return iid, {'w': w, 'h': h, 'widths': widths, 'color': '#%02x%02x%02x' % avg}


if __name__ == '__main__':
    raw, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    jobs = [(os.path.join(raw, f), out) for f in sorted(os.listdir(raw))
            if f.split('.')[-1] in ('jpg', 'png', 'webp') and f.split('.')[0] not in SKIP]
    with ProcessPoolExecutor() as ex:
        meta = dict(ex.map(work, jobs))
    json.dump(meta, open(os.path.join(out, 'media.json'), 'w'), indent=1, sort_keys=True)
    print(len(meta), 'images')
