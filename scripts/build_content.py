"""Convert the legacy case-study pages into structured content for the v2 site.

Usage: python3 scripts/build_content.py <clean-dir> content
<clean-dir> holds legacy/*.html with every base64 image replaced by IMG:<id>
(see scripts/extract_media.py). Generic parsing happens first, then CURATE
patches the handful of spots where the legacy templates differ.
"""
import sys,re,json,os
from bs4 import BeautifulSoup,Tag
clean,outdir=sys.argv[1],sys.argv[2]
def T(e): return re.sub(r'\s+',' ',e.get_text(' ',strip=True)).replace(' .','.').strip() if e else ''
def cls(e): return ' '.join(e.get('class',[])) if isinstance(e,Tag) else ''
def imgs_in(e):
    r=[]
    for x in [e]+e.find_all(True):
        for v in x.attrs.values():
            for m in re.findall(r'IMG:([0-9a-f]{10})',str(v)): r.append((m,x.get('alt','')))
    return r
def proj(fname):
    key=fname.replace('-project.html','')
    soup=BeautifulSoup(open(os.path.join(clean,fname)).read(),'html.parser')
    css=' '.join(t.get_text() for t in soup.find_all('style'))
    cssimg={}
    for m in re.finditer(r'([^{}]+)\{[^}]*?IMG:([0-9a-f]{10})',css): cssimg[m.group(1).strip()]=m.group(2)
    for x in soup.find_all(['svg','script','style','nav','footer']): x.decompose()
    body=soup.body
    hero=body.find(class_=re.compile(r'^(project-hero|hero)$'))
    P={'key':key,'slug':NAMES[key]}
    P['title']=T(hero.find('h1'))
    c=hero.find(class_=re.compile(r'(hero-cat|hero-eyebrow|hero-label|project-cat|^cat$)'))
    P['category']=T(c)
    d=hero.find(class_='hero-desc'); P['lede']=T(d)
    meta=[]
    for it in hero.find_all(class_=re.compile(r'meta-item|^info-cell')):
        kids=[k for k in it.children if isinstance(k,Tag)]
        if len(kids)>=2: meta.append([T(kids[0]),T(kids[1])])
        elif len(kids)==1: meta.append([T(it).replace(T(kids[0]),'').strip(),T(kids[0])])
    if not meta:
        hm=hero.find(class_='hero-meta')
        if hm:
            for sp in hm.find_all('span'):
                st=sp.find('strong')
                if st: meta.append([T(sp).replace(T(st),'').strip(),T(st)])
            for k in hm.find_all(class_=['year','cat']): meta.append([ 'Location' if 'year' in cls(k) else 'Discipline',T(k)])
    P['meta']=meta
    himg=[i for i,_ in imgs_in(hero)]
    for sel,i in cssimg.items():
        if 'hero' in sel and i not in himg: himg.append(i)
    P['hero']=himg
    hero_imgs=set(himg)
    info=body.find(class_=re.compile(r'^info-bar'))
    P['info']=[]
    if info:
        for it in info.find_all(class_='info-cell'):
            kids=[k for k in it.children if isinstance(k,Tag)]
            P['info'].append([T(kids[0]),T(kids[1])])
        info.decompose()
    nxt=body.find('a',class_='next-project')
    P['next']=re.sub(r'-project\.html','',nxt['href']) if nxt else None
    if nxt: nxt.decompose()
    cr=body.find(class_='credits'); P['credits']=[]
    if cr:
        for it in cr.find_all(class_='credit-item'):
            a=it.find('a'); P['credits'].append({'role':T(it.find(class_='label')),'name':T(it.find(class_='name')),'href':a['href'] if a else None})
        cr.decompose()
    hero.decompose()
    # token stream
    toks=[]
    ITEMRE=re.compile(r'^(del-item|deliverable-item|pillar|service-block|activity-card|falcon-value)$')
    def grp(img):
        # nearest ancestor with >1 images and no headings/paragraph text
        e=img.parent; best=None
        while e is not None and e is not body:
            n=len(imgs_in(e))
            if n>1:
                if e.find(['h2','h3']) or any(len(T(p))>90 for p in e.find_all('p')): break
                best=e
            e=e.parent
        return id(best) if best is not None else id(img)
    def walk(e):
        for c in e.children:
            if not isinstance(c,Tag): continue
            k=cls(c)
            if any(ITEMRE.match(x) for x in c.get('class',[])):
                kids=[x for x in c.find_all(True) if not x.find(True)]
                vals=[T(x) for x in kids if T(x)]
                full=T(c)
                if 'falcon-value' in k:
                    num=T(c.find('span')); vals=[num, full.replace(num,'',1).strip()]
                color=None
                cm=re.findall(r'activity-card (\w+)',k)
                toks.append(('ITEM',{'vals':vals,'tone':cm[0] if cm else None})); continue
            if 'swatch' in k and 'swatches' not in k:
                hx=re.findall(r'#[0-9a-fA-F]{3,6}',c.get('style',''))
                name=T(c.find(class_='swatch-name')); hexv=T(c.find(class_='swatch-hex'))
                if hx or hexv: toks.append(('SWATCH',{'hex':(hx or [hexv])[0],'name':name or None}))
                continue
            if c.name=='img' or (c.get('style') and 'IMG:' in c.get('style','')):
                for i,a in imgs_in(c):
                    if i not in hero_imgs: toks.append(('IMG',{'id':i,'alt':a,'g':grp(c)}))
                if c.name=='img': continue
            if 'tag' == k or k.startswith('tag ') : toks.append(('TAG',T(c))); continue
            if re.search(r'section-label|del-header .*|^label$',k) and not c.find(['h2']):
                toks.append(('LABEL',T(c))); continue
            if re.search(r'caption|mockup-cap',k):
                sp=[x for x in c.children if isinstance(x,Tag)]
                toks.append(('CAPTION',' — '.join(T(x) for x in sp) if len(sp)==2 and all(x.name=='span' for x in sp) else T(c))); continue
            if c.name in('h2',) or (c.name=='h3' and 'title' in k):
                toks.append(('TITLE',T(c))); continue
            if c.name=='p' and T(c):
                toks.append(('PARA',T(c))); continue
            if c.name=='span' and not c.find(True) and T(c) and 'palette' in cls(c.parent.parent) if c.parent and c.parent.parent else False:
                toks.append(('SWNAME',T(c))); continue
            if c.name=='div' and not c.find(True) and T(c) and c.parent and 'del-header' not in cls(c.parent):
                toks.append(('PARA',T(c))); continue
            walk(c)
    walk(body)
    # assemble blocks
    blocks=[];cur=None
    def flush():
        nonlocal cur
        if cur: blocks.append(cur); cur=None
    i=0
    while i<len(toks):
        t,v=toks[i]
        if t in('LABEL','TITLE','PARA','TAG'):
            if cur is None or cur['type']!='text' or (t=='LABEL' and (cur.get('label') or cur.get('title') or cur.get('paras'))) or (t=='TITLE' and (cur.get('title') or cur.get('paras'))):
                flush(); cur={'type':'text','label':None,'title':None,'paras':[],'tags':[]}
            if t=='LABEL': cur['label']=v
            elif t=='TITLE': cur['title']=v
            elif t=='PARA': cur['paras'].append(v)
            else: cur['tags'].append(v)
        elif t=='IMG':
            if cur and cur['type']=='media' and cur['g']==v['g'] and not cur.get('caption'):
                cur['images'].append({'id':v['id'],'alt':v['alt']})
            else:
                flush(); cur={'type':'media','g':v['g'],'images':[{'id':v['id'],'alt':v['alt']}],'caption':None,'captions':[]}
        elif t=='CAPTION':
            if cur and cur['type']=='media':
                cur['captions'].append(v)
            else:
                # caption after other block: attach to last media
                lm=[b for b in blocks if b['type']=='media']
                if cur and cur['type']!='media' and lm: lm[-1]['captions'].append(v)
                elif lm: lm[-1]['captions'].append(v)
        elif t=='ITEM':
            if not(cur and cur['type']=='list'):
                # promote heading from text block lacking paras
                head={}
                if cur and cur['type']=='text' and not cur['paras']: head={'label':cur['label'],'title':cur['title']}; cur=None
                flush(); cur={'type':'list','label':head.get('label'),'title':head.get('title'),'items':[]}
            cur['items'].append(v)
        elif t=='SWATCH':
            if not(cur and cur['type']=='palette'): flush(); cur={'type':'palette','swatches':[]}
            cur['swatches'].append(v)
        elif t=='SWNAME':
            pal=[b for b in blocks+([cur] if cur else []) if b['type']=='palette']
            if pal:
                for s in pal[-1]['swatches']:
                    if not s.get('name'): s['name']=v; break
        i+=1
    flush()
    for b in blocks:
        b.pop('g',None)
        if b['type']=='media':
            caps=b.pop('captions'); b['caption']=' — '.join(caps) if caps else None
            n=len(b['images']); b['layout']={1:'full',2:'pair',3:'trio'}.get(n,'grid')
    P['blocks']=blocks
    return P

NAMES = {'zeryab': 'zeryab-estates', 'masar': 'masar', 'lazure': 'lazure', 'skyfalcons': 'sky-falcons',
         'rambourg': 'rambourg', 'wakers17': 'wakers17', 'sana-interiors': 'sana-interiors'}


# legacy/rambourg-project.html .activity-card colours
TONES = {'blue': '#1847F0', 'green': '#2DAA5E', 'teal': '#00B4C5', 'navy': '#1B2F6E', 'purple': '#6B4EC1',
         'crimson': '#9B1750', 'orange': '#E85D20', 'yellow': '#E8AE00', 'pink': '#E86090'}


# Case-study covers chosen for a full-bleed hero with the title over it: atmospheric images without
# a baked-in wordmark, at least ~1400px wide. heroMobile art-directs phones where the landscape
# hero would crop to an unreadable slice.
HEROES = {
    'zeryab': {'hero': '92b5c6a3f8'},
    'masar': {'hero': '7160f3fd32'},
    'wakers17': {'hero': 'a16077e013', 'heroMobile': '28c1c11c00'},
    'sana-interiors': {'heroMobile': '58d0e9b72f'},
}


def curate(P):
    k = P['key']
    P['hero'] = P['hero'][0]
    P.update(HEROES.get(k, {}))
    P['next'] = NAMES.get(P['next'])
    if k == 'skyfalcons':
        P['meta'] = [['Client', 'SkyFalcons — Beyond Limits'], ['Industry', 'Aviation Brokerage'], ['Year', '2023']]
    if k == 'sana-interiors':
        P['meta'] = [['Client', 'Sana Interiors'], ['Location', 'Amman, Jordan'], ['Year', '2025']]
        P['category'] = 'Interior Design · Brand Identity'
    if k == 'wakers17':
        P['meta'] = [['Client', 'Wakers 17 Coffee & Juice'], ['Location', 'Amman, Jordan'], ['Year', '2023']]
        P['category'] = 'Brand Identity · F&B'
        names = ['Hot Coffee', 'Fresh Juice', 'Iced Coffee', 'Cocktails', 'Fresh Juices', 'Cookies', 'Cakes', 'Sweets']
        pal = next(b for b in P['blocks'] if b['type'] == 'palette')
        for sw, n in zip(pal['swatches'], names):
            sw['name'] = n
    if k == 'zeryab':
        P['category'] = 'Brand Identity · Luxury Residential'
    out = []
    for b in P['blocks']:
        # orphan one-paragraph text blocks: a caption (lazure) or the body of the block above (skyfalcons)
        if b['type'] == 'text' and not b['label'] and not b['title'] and len(b['paras']) == 1:
            if k == 'skyfalcons':
                tb = next(x for x in reversed(out) if x['type'] == 'text')
                tb['paras'] += b['paras']
                continue
            prev = out[-1] if out else None
            if prev and prev['type'] == 'media' and not prev['caption']:
                prev['caption'] = b['paras'][0]
                continue
        out.append(b)
    # lede: the hero intro paragraph; fall back to the first overview paragraph
    if not P['lede']:
        tb = next(b for b in out if b['type'] == 'text' and b['paras'])
        P['lede'] = tb['paras'].pop(0)
    year = dict(P['meta']).get('Year') or ''
    P['year'] = year
    for b in out:
        if b['type'] == 'list':
            for it in b['items']:
                tone = it.pop('tone', None)
                if tone:
                    it['color'] = TONES[tone]
                v = it.pop('vals')
                if k == 'rambourg' and b['label'] == 'Impact Areas':
                    it.update({'ar': v[0], 'name': v[1]})
                else:
                    it.update({'num': v[0], 'name': v[1] if len(v) > 1 else '', 'desc': ' '.join(v[2:]) or None})
    P['blocks'] = out
    return P


ORDER = ['zeryab', 'masar', 'lazure', 'skyfalcons', 'rambourg', 'wakers17', 'sana-interiors']
projects = {p['key']: curate(p) for p in (proj(f) for f in sorted(os.listdir(clean)) if f.endswith('-project.html'))}
out = [projects[k] for k in ORDER]
json.dump(out, open(os.path.join(outdir, 'projects.json'), 'w'), indent=1, ensure_ascii=False)
print(len(out), 'projects')
