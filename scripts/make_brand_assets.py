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
solutions = json.loads((ROOT / 'content' / 'solutions.json').read_text())

FONT_CSS = f"""
@font-face {{ font-family: 'Cormorant Garamond'; font-weight: 300; font-style: normal;
  src: url('file://{FONTS}/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2'); }}
@font-face {{ font-family: 'Cormorant Garamond'; font-weight: 300; font-style: italic;
  src: url('file://{FONTS}/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-italic.woff2'); }}
@font-face {{ font-family: 'Slack'; src: url('file://{ROOT}/public/fonts/slack-light.woff2'); }}
@font-face {{ font-family: 'Inter Tight'; font-weight: 100 900;
  src: url('file://{FONTS}/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2'); }}
"""
LOGO = (ROOT / 'app/components/LonLogo.vue').read_text().split('<template>')[1].split('</template>')[0]


def og_html(image, kicker, title, sub):
    """Centred 'capabilities deck' card: treated image, gold Slack title, uppercase subtitle."""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}
    body {{ margin:0; width:1200px; height:630px; position:relative; overflow:hidden; background:#12100a; color:#e6df8f; font-family:'Inter Tight'; }}
    .bg {{ position:absolute; inset:0; background:url('file://{image}') center/cover; filter:saturate(.74) sepia(.2) brightness(.62) contrast(1.06); }}
    .shade {{ position:absolute; inset:0; background:radial-gradient(ellipse 70% 70% at 50% 50%, rgba(18,16,10,.25), rgba(18,16,10,.8)); }}
    .c {{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 80px; }}
    .k, .s {{ font-family:'Slack'; text-transform:uppercase; letter-spacing:.09em; }}
    .k {{ font-size:18px; color:rgba(245,242,234,.72); margin-bottom:34px; }}
    h1 {{ margin:0; font:400 84px/1.04 'Slack'; letter-spacing:-.01em; }}
    h1 em {{ font-family:'Cormorant Garamond'; font-style:italic; font-weight:300; font-size:1.12em; }}
    .s {{ font-size:20px; margin-top:34px; }}
    .logo {{ position:absolute; left:50%; bottom:44px; transform:translateX(-50%); width:150px; color:#e6df8f; opacity:.85; }}
    .logo svg {{ width:100%; height:auto; }}
    </style></head><body><div class="bg"></div><div class="shade"></div>
    <div class="c"><div class="k">{kicker}</div><h1>{title}</h1><div class="s">{sub}</div></div><div class="logo">{LOGO}</div></body></html>"""


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
        cards = [('home', 'c5aa67204b', 'Visual Strategy Studio · Amman', 'We translate brands<br>into <em>visual language</em>', 'Strategic brand &amp; visual communication studio')]
        cards += [(pr['slug'], pr['hero'], 'Case study' + (f" · {pr['year']}" if pr['year'] else ''), pr['title'], pr['category']) for pr in projects]
        cards += [(f"solutions-{so['slug']}", so['hero'], 'Solutions · Lōn Visuals', so['title'], 'Hotels, resorts &amp; F&amp;B · Saudi Arabia, Jordan &amp; the GCC') for so in solutions]
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
