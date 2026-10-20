/* Soul Seekers v37.0 — DM scene background and atmosphere director.
   Artwork is prepackaged or a small optimized webp; never puts arbitrary URLs
   or oversized original uploads into the shared state. */
import {db, authReady, hasDMRole, isLocalPreview} from './firebase.js';
import {doc, onSnapshot, setDoc, serverTimestamp} from './firebaseTransport.js';
import {BACKGROUNDS, SCENES} from './backgroundLibrary.js';

const ref=doc(db,'stageState','scenery');
const storageKey='soulseekers-scenery-v36-8';
const channel=isLocalPreview&&'BroadcastChannel' in window?new BroadcastChannel('soulseekers-scenery-v36-8'):null;
const allowed=new Map(BACKGROUNDS.map(x=>[x.id,x]));
const defaults={terminal:'town',combat:'fall3',stage:'winternight1',dm:'skyline-boston'};
const emptyTime='';
const customRe=/^data:image\/webp;base64,[a-zA-Z0-9+/]+={0,2}$/;
const maxImageChars=205000;
let current=normalize({});
let unsub=null;
let applyingRemote=false;

function normalizeBackground(item, fallback){
  if(typeof item==='string'&&allowed.has(item))return item;
  if(typeof item==='string'&&item.startsWith('data:image/webp;base64,')&&item.length<=maxImageChars&&customRe.test(item))return item;
  return fallback;
}
function normalize(raw={}){
  const backgrounds={};
  for(const scene of SCENES)backgrounds[scene]=normalizeBackground(raw.backgrounds?.[scene],defaults[scene]);
  return {backgrounds,weather:['clear','rain','snow','leaves'].includes(raw.weather)?raw.weather:emptyTime,
    timeOfDay:['day','night'].includes(raw.timeOfDay)?raw.timeOfDay:emptyTime,
    serial:Number.isSafeInteger(raw.serial)&&raw.serial>=0?raw.serial:0};
}
function imageSrc(value){return allowed.get(value)?.path||(customRe.test(value||'')&&value.length<=maxImageChars?value:'');}
function cssImage(value){const src=imageSrc(value);return src?`url("${src}")`:'none';}
function publicState(){return typeof structuredClone==='function'?structuredClone(current):JSON.parse(JSON.stringify(current));}
function emitStatus(message,problem=false){
  const label=document.getElementById('dmBackdropStatus');
  if(label){label.textContent=message;label.dataset.error=String(problem);}
}
function setSceneCss(){
  for(const scene of SCENES)document.body.style.setProperty(`--ss-${scene}-background`,cssImage(current.backgrounds[scene]));
  const preview=document.getElementById('dmPreviewScreen');
  if(preview){
    const scene=SCENES.includes(preview.dataset.scene)?preview.dataset.scene:'terminal';
    preview.style.setProperty('--ss-preview-background',cssImage(current.backgrounds[scene]));
  }
}
function accept(next,{local=false}={}){
  const normalized=normalize(next);
  const changed=JSON.stringify(normalized)!==JSON.stringify(current);
  current=normalized;
  setSceneCss();
  if(local){try{localStorage.setItem(storageKey,JSON.stringify(current));}catch{}
    try{channel?.postMessage(current);}catch{}}
  if(current.weather||current.timeOfDay){
    try {
      if(current.weather)localStorage.setItem('soul-seekers-weather-v17',current.weather);
      if(current.timeOfDay)localStorage.setItem('soul-seekers-day-night-v17',current.timeOfDay);
    } catch {}
    window.dispatchEvent(new CustomEvent('soulseekers:atmosphere-apply',{
      detail:{weather:current.weather||undefined,timeOfDay:current.timeOfDay||undefined,source:'director'}
    }));
  }
  if(changed)window.dispatchEvent(new CustomEvent('soulseekers:scenerystate',{detail:publicState()}));
}
async function commit(partial){
  if(!hasDMRole())throw new Error('Trusted director access required.');
  const next=normalize({...current,...partial,backgrounds:{...current.backgrounds,...(partial.backgrounds||{})},serial:current.serial+1});
  accept(next,{local:isLocalPreview});
  try{await setDoc(ref,{...next,build:'v37.0',updatedAt:serverTimestamp()},{merge:true});
    emitStatus('SCENES SAVED · Ready on the broadcast displays');
  }catch(error){
    if(!isLocalPreview){emitStatus('Scene synchronization failed. Check connection / permissions.',true);throw error;}
    emitStatus('LOCAL PREVIEW · Synced across browser tabs');
  }
  return publicState();
}
function setBackground(scene,image){
  if(!SCENES.includes(scene))return Promise.reject(new Error('Unknown scene.'));
  const clean=normalizeBackground(image,'');
  if(!clean)return Promise.reject(new Error('Unrecognized image. Choose an image from the library or upload WebP.'));
  return commit({backgrounds:{[scene]:clean}});
}
function setAllBackgrounds(image){
  const clean=normalizeBackground(image,'');
  if(!clean)return Promise.reject(new Error('Unrecognized image.'));
  return commit({backgrounds:Object.fromEntries(SCENES.map(s=>[s,clean]))});
}
function resetBackground(scene){
  if(!SCENES.includes(scene))return Promise.reject(new Error('Unknown scene.'));
  return commit({backgrounds:{[scene]:defaults[scene]}});
}
function setAtmosphere(next){
  const valid={};
  if(['day','night'].includes(next.timeOfDay))valid.timeOfDay=next.timeOfDay;
  if(['clear','rain','snow','leaves'].includes(next.weather))valid.weather=next.weather;
  if(!Object.keys(valid).length)return Promise.reject(new Error('Invalid atmosphere selection.'));
  return commit(valid);
}
function readLocal(){try{return JSON.parse(localStorage.getItem(storageKey)||'null');}catch{return null;}}
async function start(){
  if(isLocalPreview){const saved=readLocal();if(saved)accept(saved);}
  await authReady.catch(()=>null);
  if(unsub)return;
  unsub=onSnapshot(ref,snapshot=>{
    if(snapshot.exists())accept(snapshot.data(),{local:isLocalPreview});
  },error=>{if(!isLocalPreview)console.warn('Scene director sync unavailable',error);});
}
if(channel)channel.addEventListener('message',event=>accept(event.data||{}));
window.addEventListener('storage',event=>{if(isLocalPreview&&event.key===storageKey&&event.newValue){try{accept(JSON.parse(event.newValue));}catch{}}});
window.addEventListener('soulseekers:sessionstate',setSceneCss);
const playerPreview=document.getElementById('dmPreviewScreen');
if(playerPreview)new MutationObserver(setSceneCss).observe(playerPreview,{attributes:true,attributeFilter:['data-scene']});
window.addEventListener('soulseekers:atmosphere-director-change',event=>{
  if(hasDMRole())void setAtmosphere(event.detail||{}).catch(e=>console.warn('Atmosphere publish failed',e));
});
window.addEventListener('pagehide',()=>{unsub?.();try{channel?.close();}catch{}},{once:true});
window.SoulSeekerSceneDirector={getState:publicState,library:BACKGROUNDS,scenes:SCENES,
  setBackground,setAllBackgrounds,resetBackground,setAtmosphere,getImageSrc:imageSrc,
  getDefault:scene=>defaults[scene]};
accept(current);
void start();
