#!/usr/bin/env python3
"""Regenere preview.html (maquette locale du template Webflow) a partir des embeds.
Usage : python3 tools/build_preview.py   (depuis story/)
Puis : python3 -m http.server 8000  et ouvrir http://localhost:8000/preview.html"""
import glob, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
embeds = "\n".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(root, "embeds", "*.html"))))
html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>dl-story kit | prévisualisation locale</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap">
<script>document.documentElement.classList.add('dl-js')</script>
<style>body{{margin:0}}</style>
</head>
<body>
{embeds}
<script type="module" src="../modules/dl-story.js"></script>
</body>
</html>
"""
open(os.path.join(root, "preview.html"), "w", encoding="utf-8").write(html)
print("preview.html ecrit,", len(html), "caracteres")
