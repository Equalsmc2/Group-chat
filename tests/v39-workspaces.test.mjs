import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
// Exercise the actual workspace recomposition with a minimal DOM fixture.
// This checks element ownership and keyboard behavior, not browser geometry.
class Element {
 constructor(tag='div',className='',text=''){this.tagName=tag;this.className=className;this.textContent=text;this.children=[];this.attributes={};this.events={};}
 append(...nodes){for(const node of nodes){if(node.parent)node.parent.children.splice(node.parent.children.indexOf(node),1);this.children.push(node);node.parent=this;}}
 prepend(node){this.append(node);this.children.unshift(this.children.pop());}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,f){this.events[k]=f;}
 focus(){this.focused=true;}
 querySelector(selector){return this.children.find(c=>'.'+c.className===selector)||null;}
}
function fixture(){
 const dashboard=new Element(),primary=new Element(),grid=new Element();
 const panels=Array.from({length:5},()=>{const p=new Element('details');p.append(new Element('div','dm-panel-body'));grid.append(p);return p;});
 const deck=new Element('section','dm-sfx-console');panels[2].children[0].append(deck);dashboard.append(primary,grid);
 const source=readFileSync(new URL('../experience.js',import.meta.url),'utf8');
 const start=source.indexOf(" const dashboard=$('dmControlDashboard')");const end=source.indexOf(" const monitor=make('aside'",start);
 assert.ok(start>=0 && end>start);
 vm.runInNewContext(source.slice(start,end),{$:()=>dashboard,document:{querySelector:s=>s==='.dm-director-primary'?primary:s==='.dm-panel-grid'?grid:deck},make:(...args)=>new Element(...args)});
 const workbench=dashboard.children.find(c=>c.className==='director-workbench');
 return {dashboard,primary,grid,panels,deck,workbench,nav:workbench.children[0]};
}
test('director recomposition preserves existing controls and locates Sound Deck in Sound Desk',()=>{
 const {primary,grid,panels,deck,workbench,nav}=fixture();
 assert.equal(workbench.children[1],primary);assert.equal(workbench.children[2],grid);assert.equal(nav.children.length,5);
 assert.equal(deck.parent.parent,panels[2].children[0]);assert.equal(panels[0].hidden,false);assert.equal(panels[2].hidden,true);
 nav.children[2].events.click();assert.equal(panels[2].hidden,false);assert.equal(panels[2].open,true);
 assert.equal(panels.filter(p=>!p.hidden).length,1);assert.equal(nav.children[2].attributes['aria-selected'],'true');
});
test('workspace keys wrap and retain one keyboard tab stop',()=>{
 const {nav,panels}=fixture();let prevented=false;
 nav.events.keydown({target:nav.children[0],key:'ArrowLeft',preventDefault(){prevented=true;}});
 assert.ok(prevented);assert.equal(panels[4].hidden,false);assert.equal(nav.children[4].focused,true);
 assert.equal(nav.children.filter(b=>b.tabIndex===0).length,1);
 nav.events.keydown({target:nav.children[4],key:'Home',preventDefault(){}});assert.equal(panels[0].hidden,false);
});
