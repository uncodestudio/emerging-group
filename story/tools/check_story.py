#!/usr/bin/env python3
"""Verifie qu'un ou plusieurs embeds HTML respectent STORY-GUIDE.md.
Usage : python3 check_story.py embed1.html [embed2.html ...]
Code retour 0 = OK, 1 = erreurs."""
import sys, re
from html.parser import HTMLParser

LIMIT = 50000
TAGS = set("article b details div em figcaption figure h2 h3 h4 i li ol p section span strong summary table tbody td th thead tr ul a br".split())
VOID = {"br"}
# header et h1 sont volontairement absents : le titre (h1) et le bandeau d'ouverture
# appartiennent au template Webflow, jamais a un embed (voir STORY-GUIDE.md §3).
CLASSES = set("""dl-story dl-wrap dl-eyebrow dl-kpis dl-val dl-lab dl-poolmeta dl-poolcap dl-scrollcue dl-bounce
dl-scrolly dl-step dl-scene dl-scene-title dl-cap dl-sub dl-body dl-bignum dl-stackbar dl-bars dl-bars-lg dl-bars-lq
dl-viz dl-ranklist dl-callout dl-block dl-lead dl-substrip dl-map dl-mapdata dl-regdata dl-data dl-cards dl-card
dl-card-title dl-card-sub dl-patterns dl-pat dl-pat-title dl-outro dl-closer dl-concl dl-foot dl-brandlock dl-dots
dl-ring dl-g dl-hl dl-t""".split())
DATA_ATTRS = {"data-n","data-v","data-c","data-max","data-min","data-minw","data-viz","data-label","data-id","data-base","data-base-label","data-label-min","data-topo","data-hot"}
COLORS = set("navy navy-2 peri peri-2 peri-3 lav-1 lav-2 lav-3 gold salmon spark soft soft-2".split())
FORBID_TAGS = {"script","style","link","iframe","object","embed","form","input","button","svg","img","video"}

class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.stack=[]; s.err=[]; s.h=[]; s.steps=[]; s.text=[]; s.pos=None
    def e(s,m): s.err.append(f"l.{s.getpos()[0]}: {m}")
    def handle_starttag(s,t,a):
        if t in FORBID_TAGS: s.e(f"balise interdite <{t}>")
        elif t not in TAGS: s.e(f"balise non autorisee <{t}>")
        d=dict(a)
        for k,v in a:
            if k=="style": s.e("attribut style interdit")
            elif k.startswith("on"): s.e(f"attribut {k} interdit")
            elif k=="class":
                for c in (v or "").split():
                    if c not in CLASSES: s.e(f"classe inconnue .{c}")
            elif k.startswith("data-"):
                if k not in DATA_ATTRS: s.e(f"attribut {k} inconnu")
                if k=="data-v" and not re.fullmatch(r"-?\d+(\.\d+)?", v or ""): s.e(f'data-v doit etre un nombre pur : "{v}"')
                if k=="data-c" and v not in COLORS: s.e(f'data-c inconnu "{v}"')
            elif k not in ("id","href","scope","colspan","open","aria-label","aria-hidden","lang","title","rel","target"):
                s.e(f"attribut {k} non autorise")
        if re.fullmatch(r"h[1-4]",t): s.h.append((t,s.getpos()[0]))
        if t=="div" and "dl-step" in (d.get("class") or "").split(): s.steps.append([s.getpos()[0],0,"data-n" in d])
        if t=="figure" and "dl-scene" in (d.get("class") or "").split():
            if s.steps: s.steps[-1][1]+=1
            else: s.e("figure.dl-scene hors d'un .dl-step")
        if t not in VOID: s.stack.append((t,s.getpos()[0]))
    def handle_endtag(s,t):
        if t in VOID: return
        if not s.stack or s.stack[-1][0]!=t:
            s.e(f"</{t}> ne ferme pas <{s.stack[-1][0] if s.stack else '?'}> (ouvert l.{s.stack[-1][1] if s.stack else '?'})")
            for i in range(len(s.stack)-1,-1,-1):
                if s.stack[i][0]==t: del s.stack[i:]; break
        else: s.stack.pop()
    def handle_data(s,d): s.text.append(d)

def main(files):
    bad=0; h1=0; allh=[]
    for f in files:
        h=open(f,encoding="utf-8").read(); n=len(h); err=[]
        if n>=LIMIT: err.append(f"{n} caracteres : depasse {LIMIT}")
        if not h.lstrip().startswith('<div class="dl-story">'): err.append('doit commencer par <div class="dl-story">')
        if not h.rstrip().endswith("</div>"): err.append("doit finir par </div>")
        p=P(); p.feed(h); p.close(); err+=p.err
        for t,l in p.stack: err.append(f"<{t}> ouvert l.{l} jamais ferme")
        for l,c,hasn in p.steps:
            if c!=1: err.append(f"l.{l}: .dl-step doit contenir exactement 1 figure.dl-scene (trouve {c})")
            if not hasn: err.append(f"l.{l}: .dl-step sans data-n")
        h1+=sum(1 for t,_ in p.h if t=="h1"); allh+=p.h
        words=len(re.sub(r"\s+"," "," ".join(p.text)).split())
        print(f"{'OK ' if not err else 'KO '} {f}: {n} car., {words} mots, {len(p.steps)} etapes, titres {[t for t,_ in p.h]}")
        for e in err: print("   -",e); bad+=1
    if h1>1: print(f"   - {h1} balises h1 sur l'ensemble : une seule autorisee"); bad+=1
    last=1
    for t,l in allh:
        lv=int(t[1])
        if lv>last+1: print(f"   - saut de niveau de titre : h{last} -> h{lv} (l.{l})"); bad+=1
        last=lv
    print("RESULTAT :", "conforme" if not bad else f"{bad} probleme(s)")
    return 1 if bad else 0
if __name__=="__main__": sys.exit(main(sys.argv[1:]) if len(sys.argv)>1 else print(__doc__) or 1)
