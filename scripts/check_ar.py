"""List the English strings of each inner page that have no Arabic yet.

Usage: python3 scripts/check_ar.py [name ...]   (names: work-<key>, solution-<key>; default: all)
Mirrors localize() in app/utils/i18n.ts: content/ar/common.json plus content/ar/<name>.json,
whole-string matches, structural fields skipped. Exit status 1 when anything is missing.
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
KEEP = {'id', 'slug', 'key', 'href', 'hex', 'image', 'hero', 'heroMobile', 'next', 'to', 'theme', 'surface', 'layout', 'type', 'color'}
# fields the pages never show as text
SILENT = {'ogSub', 'heroFocus', 'focus', 'ratio', 'introTheme'}
WORK_SILENT = {'seoTitle'}  # an Arabic case study builds its title from its title and category

def load(name):
    p = os.path.join(ROOT, 'content', 'ar', f'{name}.json')
    return json.load(open(p)) if os.path.exists(p) else {}

def missing(obj, d):
    out = []
    def walk(v, k=None):
        if isinstance(v, str):
            if k not in KEEP and re.search(r'[A-Za-z]{3}', v) and v not in d: out.append((k, v))
        elif isinstance(v, list):
            for x in v: walk(x)
        elif isinstance(v, dict):
            for kk, x in v.items(): walk(x, kk)
    walk(obj)
    seen, res = set(), []
    for k, v in out:
        if v not in seen: seen.add(v); res.append((k, v))
    return res

pages = {f"work-{p['key']}": p for p in json.load(open(os.path.join(ROOT, 'content', 'projects.json')))}
pages.update({f"solution-{s['key']}": s for s in json.load(open(os.path.join(ROOT, 'content', 'solutions.json')))})
names = sys.argv[1:] or list(pages)
common = load('common')
bad = 0
for n in names:
    m = [(k, v) for k, v in missing(pages[n], {**common, **load(n)}) if k not in SILENT and not (n.startswith('work-') and k in WORK_SILENT)]
    print(f'{n}: {len(m)} missing')
    for k, v in m: print(f'  [{k}] {v}')
    bad += len(m)
sys.exit(1 if bad else 0)
