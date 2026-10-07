#!/usr/bin/env python3
"""Test de rendu (Playwright) de preview.html servi en HTTP.
Prerequis : pip install playwright && playwright install chromium
Usage : python3 -m http.server 8000 &   puis   python3 tools/render_test.py [http://localhost:8000] [--libs DOSSIER]
--libs : dossier contenant d3.min.js et topojson.min.js (test hors ligne)."""
import sys, os
from playwright.sync_api import sync_playwright
args = [a for a in sys.argv[1:] if not a.startswith("--")]
base = args[0] if args else "http://localhost:8000"
libs = sys.argv[sys.argv.index("--libs") + 1] if "--libs" in sys.argv else None
if libs and libs in args: args.remove(libs); base = args[0] if args else base
fails = []
def check(name, ok, info=""):
    print(("OK  " if ok else "KO  ") + name, info); 
    if not ok: fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1280, "height": 800})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    if libs:
        def r(route):
            u = route.request.url
            if "d3.min.js" in u: route.fulfill(path=os.path.join(libs, "d3.min.js"), content_type="application/javascript")
            elif "topojson" in u: route.fulfill(path=os.path.join(libs, "topojson.min.js"), content_type="application/javascript")
            elif "fonts.g" in u: route.fulfill(body="", content_type="text/css")
            else: route.continue_()
        pg.route("**/*", r)
    pg.goto(base + "/preview.html", wait_until="networkidle"); pg.wait_for_timeout(2000)
    n = pg.evaluate("document.querySelectorAll('.dl-scrolly .dl-step').length")
    check("scrollys en mode live", pg.evaluate("document.querySelectorAll('.dl-scrolly.dl-live').length") >= 1)
    check("une scene par etape", pg.evaluate("document.querySelectorAll('.dl-stage .dl-scene').length") == n, f"{n} etapes")
    check("barres decorees", pg.evaluate("document.querySelectorAll('.dl-fill').length") > 0)
    seen = set()
    for i in range(n):
        pg.evaluate(f"document.querySelectorAll('.dl-scrolly .dl-step')[{i}].scrollIntoView({{block:'center'}})"); pg.wait_for_timeout(400)
        seen.add(pg.evaluate(f"(()=>{{const s=document.querySelectorAll('.dl-scrolly .dl-step')[{i}];return s.closest('.dl-scrolly').querySelector('.dl-scene.dl-active')?.querySelector('.dl-scene-title')?.textContent}})()"))
    check("une scene active par etape", len(seen) == n, f"{len(seen)} scenes distinctes")
    pg.evaluate("document.querySelector('.dl-map').scrollIntoView()"); pg.wait_for_timeout(2500)
    check("carte dessinee", pg.evaluate("document.querySelectorAll('.dl-map svg path').length") > 100)
    pg.fill(".dl-map .dl-mapsearch", "France"); pg.wait_for_timeout(500)
    check("recherche pays", "Consulting" in pg.inner_text(".dl-map"))
    check("pas de scroll horizontal (desktop)", not pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
    check("aucune erreur JS", not errs, str(errs))
    m = b.new_context(viewport={"width": 390, "height": 800}).new_page()
    if libs: m.route("**/*", r)
    m.goto(base + "/preview.html", wait_until="networkidle"); m.wait_for_timeout(1200)
    check("pas de scroll horizontal (mobile)", not m.evaluate("document.documentElement.scrollWidth>innerWidth"))
    nj = b.new_context(java_script_enabled=False).new_page(); nj.goto(base + "/preview.html"); nj.wait_for_timeout(800)
    check("lisible sans JS", len(nj.inner_text("body")) > 5000 and "Luxembourg" in nj.inner_text("body"), str(len(nj.inner_text('body'))) + " car.")
    b.close()
print("RESULTAT:", "OK" if not fails else f"{len(fails)} echec(s)"); sys.exit(1 if fails else 0)
