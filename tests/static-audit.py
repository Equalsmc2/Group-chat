#!/usr/bin/env python3
"""Static packaging audit for Soul Seekers v30 (no network/browser required)."""
from pathlib import Path
from html.parser import HTMLParser
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        for key in ('src','href'):
            if a.get(key): self.refs.append((tag,key,a[key]))

p=Parser(); p.feed(HTML)
dups=sorted({value for value in p.ids if p.ids.count(value)>1})
assert not dups, f'duplicate IDs: {dups}'

missing=[]
for tag,key,value in p.refs:
    if value.startswith(('http://','https://','#','mailto:','tel:','data:','javascript:')): continue
    clean=value.split('?',1)[0].split('#',1)[0]
    if clean and not (ROOT/clean).exists(): missing.append((tag,key,value))

for css in ROOT.glob('*.css'):
    text=css.read_text(encoding='utf-8')
    no_comments=re.sub(r'/\*.*?\*/','',text,flags=re.S)
    assert no_comments.count('{') == no_comments.count('}'), f'unbalanced CSS braces: {css.name}'
    for raw in re.findall(r'url\(([^)]+)\)',no_comments):
        value=raw.strip().strip('"\'')
        if value.startswith(('http://','https://','data:','#','var(')): continue
        clean=value.split('?',1)[0].split('#',1)[0]
        if clean and not (css.parent/clean).exists(): missing.append((css.name,'url',value))
assert not missing, f'missing local references: {missing}'

for js in list(ROOT.glob('*.js')) + list((ROOT/'tests').glob('*.mjs')):
    text=js.read_text(encoding='utf-8')
    for spec in re.findall(r"(?:from\s+|import\s*\()\s*['\"]([^'\"]+)['\"]",text):
        if spec.startswith(('http://','https://','node:')): continue
        if spec.startswith('.'):
            clean=spec.split('?',1)[0].split('#',1)[0]
            assert (js.parent/clean).resolve().exists(), f'missing import {spec} from {js.name}'

assert 'bostonMap.js' not in HTML
assert 'leaflet' not in HTML.lower()
assert 'id="bostonMap"' not in HTML
assert not (ROOT/'bostonMap.js').exists()
assert not (ROOT/'themes.css').exists()

required={'terminalTab','combatTab','stageTab','dmTab','stageView','dmControlView','broadcastOverlay','tvPermissionGate','combatGrid','visualizerCanvas'}
assert required.issubset(set(p.ids)), f'missing v30 hooks: {sorted(required-set(p.ids))}'

print(f'static audit passed: {len(p.ids)} unique IDs, refs/imports/assets valid')
