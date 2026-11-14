#!/usr/bin/env python3
"""Rebuild the playable bundles from the screen sources.

Sources:  Design System/<screen>-demo.html  (+ tools/glue/<screen>.html, the shell hand-off code)
Outputs:  game/index.html  and  Design System/horizons-game.html
Each bundle keeps its own shell; only the <script id="screens"> JSON line is replaced.
Run from the repo root:  python3 tools/build-game.py
"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DS = os.path.join(ROOT, 'Design System')
SCREENS = [('home', 'home-screen-demo.html'), ('select', 'mission-select-demo.html'), ('base', 'base-workshop-demo.html'),
           ('launch', 'launch-demo.html'), ('control', 'mission-control-demo.html')]
PRE = '<!doctype html>\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

d = {}
for name, fn in SCREENS:
    p = os.path.join(DS, fn)
    if not os.path.exists(p):
        continue
    src = read(p)
    assert len(src) > 2000, 'suspiciously small source: ' + fn
    glue = os.path.join(ROOT, 'tools', 'glue', name + '.html')
    d[name] = PRE + src + ('\n' + read(glue) if os.path.exists(glue) else '')

for out in [os.path.join(ROOT, 'game', 'index.html'), os.path.join(DS, 'horizons-game.html')]:
    lines = read(out).split('\n')
    i = next(k for k, l in enumerate(lines) if '<script id="screens"' in l)
    l = lines[i]; a = l.index('>') + 1; b = l.rindex('</script>')
    lines[i] = l[:a] + json.dumps(d).replace('</', '<\\/') + l[b:]
    data = '\n'.join(lines)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(data)
    print('built', os.path.relpath(out, ROOT), len(data), 'bytes,', len(d), 'screens')
