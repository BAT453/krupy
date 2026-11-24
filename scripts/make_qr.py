"""Генерує аркуш QR-наліпок: python scripts/make_qr.py https://<логін>.github.io/krupy/
Потрібно: pip install segno. Результат: scripts/qr-sheet.html (відкрити в браузері й надрукувати)."""
import json, sys, html, segno
from pathlib import Path

root = Path(__file__).resolve().parent.parent
base = (sys.argv[1] if len(sys.argv) > 1 else "").rstrip("/")
if not base.startswith("http"):
    sys.exit("Вкажіть адресу сайту: python scripts/make_qr.py https://<логін>.github.io/krupy/")
items = json.loads((root / "data" / "krupy.json").read_text(encoding="utf-8"))
cells = ""
for g in items:
    svg = segno.make(f"{base}/#{g['id']}", error="m").svg_inline(scale=8, border=1, dark="#000")
    cells += f'<figure>{svg}<figcaption><b>{html.escape(g.get("nick") or g["name"])}</b><br>{html.escape(g["brand"])}</figcaption></figure>\n'
page = f"""<!doctype html><html lang="uk"><head><meta charset="utf-8"><title>QR-наліпки</title>
<style>@page{{size:A4;margin:12mm}}body{{font-family:sans-serif;margin:0}}main{{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm}}
figure{{margin:0;border:1px dashed #888;padding:4mm;text-align:center;break-inside:avoid}}svg{{width:42mm;height:42mm}}figcaption{{font-size:10pt;margin-top:2mm}}</style></head>
<body><main>
{cells}</main></body></html>"""
out = Path(__file__).resolve().parent / "qr-sheet.html"
out.write_text(page, encoding="utf-8")
print(f"Готово: scripts/qr-sheet.html ({len(items)} наліпок)")
