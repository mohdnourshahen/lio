"""Pull every base64 data-URI image out of legacy/*.html into files named by content hash.

Usage: python3 scripts/extract_media.py legacy <raw-dir> <clean-dir>
<clean-dir> receives copies of the pages with each image replaced by IMG:<id>.
"""
import re,glob,hashlib,base64,os,json,sys
src,out,clean=sys.argv[1],sys.argv[2],sys.argv[3]
pat=re.compile(r'data:(image/[a-z+]+);base64,([A-Za-z0-9+/=\s]+)')
index={}
for f in sorted(glob.glob(os.path.join(src,'*.html'))):
    s=open(f).read()
    def rep(m):
        mime=m.group(1); data=base64.b64decode(re.sub(r'\s','',m.group(2)))
        h=hashlib.sha1(data).hexdigest()[:10]
        ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/svg+xml':'svg','image/gif':'gif','image/avif':'avif'}.get(mime,'bin')
        p=os.path.join(out,h+'.'+ext)
        if not os.path.exists(p): open(p,'wb').write(data)
        index.setdefault(h,{'ext':ext,'bytes':len(data),'pages':[]})['pages'].append(os.path.basename(f))
        return 'IMG:'+h
    s2=pat.sub(rep,s)
    open(os.path.join(clean,os.path.basename(f)),'w').write(s2)
json.dump(index,open(os.path.join(out,'index.json'),'w'),indent=1)
print(len(index))
