"""Render favicons, the schema.org logo and Open Graph cards with Playwright + Pillow.

Usage: python3 scripts/make_brand_assets.py   (run from the repo root after scripts/optimise_media.py)
Writes public/favicon.ico, public/icon-*.png, public/apple-touch-icon.png, public/logo.png
and public/og/<page>.jpg (1200×630) using Lōn's fonts from node_modules.
"""
import io, json, pathlib
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / 'public'
FONTS = ROOT / 'node_modules'
projects = json.loads((ROOT / 'content' / 'projects.json').read_text())

FONT_CSS = f"""
@font-face {{ font-family: 'Cormorant Garamond'; font-weight: 300; font-style: normal;
  src: url('file://{FONTS}/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2'); }}
@font-face {{ font-family: 'Cormorant Garamond'; font-weight: 300; font-style: italic;
  src: url('file://{FONTS}/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-italic.woff2'); }}
@font-face {{ font-family: 'Inter Tight'; font-weight: 100 900;
  src: url('file://{FONTS}/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2'); }}
"""
LOGO = (ROOT / 'app/components/LonLogo.vue').read_text().split('<template>')[1].split('</template>')[0]


def og_html(image, kicker, title, sub):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}
    body {{ margin:0; width:1200px; height:630px; position:relative; overflow:hidden; background:#18160e; color:#f5f2ea; font-family:'Inter Tight'; }}
    .bg {{ position:absolute; inset:0; background:url('file://{image}') center/cover; }}
    .shade {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(24,22,14,.55) 0%, rgba(24,22,14,.15) 40%, rgba(24,22,14,.85) 100%); }}
    .logo {{ position:absolute; left:64px; top:56px; width:220px; color:#f5f2ea; }}
    .logo svg {{ width:100%; height:auto; }}
    .k {{ position:absolute; right:64px; top:60px; font-size:20px; letter-spacing:.02em; color:rgba(245,242,234,.8); }}
    h1 {{ position:absolute; left:60px; right:60px; bottom:96px; margin:0; font:300 104px/0.95 'Cormorant Garamond'; letter-spacing:-.03em; }}
    h1 em {{ color:#d4b96a; }}
    p {{ position:absolute; left:64px; bottom:52px; margin:0; font-size:22px; color:rgba(245,242,234,.75); }}
    </style></head><body><div class="bg"></div><div class="shade"></div>
    <div class="logo">{LOGO}</div><div class="k">{kicker}</div><h1>{title}</h1><p>{sub}</p></body></html>"""


def best(iid):
    files = sorted(PUB.glob(f'media/{iid}-*.webp'), key=lambda f: int(f.stem.split('-')[-1]))
    return files[-1]


def main():
    (PUB / 'og').mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 512, 'height': 512})
        svg = (PUB / 'favicon.svg').read_text()
        pg.set_content(f'<body style="margin:0;background:transparent">{svg.replace("<svg ", "<svg width=512 height=512 ", 1)}</body>')
        tile = Image.open(io.BytesIO(pg.screenshot(omit_background=True, clip={'x': 0, 'y': 0, 'width': 512, 'height': 512}))).convert('RGBA')
        for size, name in [(32, 'icon-32.png'), (192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png'), (512, 'logo.png')]:
            tile.resize((size, size), Image.LANCZOS).save(PUB / name, optimize=True)
        tile.save(PUB / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

        pg = b.new_page(viewport={'width': 1200, 'height': 630})
        cards = [('home', 'b42e0ba664', 'Visual Strategy Studio · Amman', 'We translate brands<br>into <em>visual language</em>', 'Lōn Visuals — brand strategy, visual identity and design')]
        cards += [(pr['slug'], pr['hero'], pr['category'], pr['title'], f"Case study · {pr['year'] + ' · ' if pr['year'] else ''}Lōn Visuals") for pr in projects]
        for slug, iid, kicker, title, sub in cards:
            # loaded from a file URL so the page may read local fonts and images
            tmp = PUB / 'og' / '_card.html'
            tmp.write_text(og_html(best(iid), kicker, title, sub))
            pg.goto(tmp.as_uri())
            pg.evaluate('document.fonts.ready')
            pg.wait_for_timeout(200)
            img = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
            img.save(PUB / 'og' / f'{slug}.jpg', quality=86, optimize=True, progressive=True)
        (PUB / 'og' / '_card.html').unlink()
        b.close()
    print('brand assets written')


if __name__ == '__main__':
    main()
