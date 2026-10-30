/* v36.9 — trusted desktop operator UX; TV only receives scenery state. */
import {hasDMRole} from './firebase.js';
const director=window.SoulSeekerSceneDirector;
const $=id=>document.getElementById(id);
const sceneControl=$('dmBackdropScene');
const gallery=$('dmBackdropGallery');
if(director&&sceneControl&&gallery){
  const library=director.library;
  let selected=director.getState().backgrounds[sceneControl.value];
  let selectedName='';
  const status=(text,isError=false)=>{const node=$('dmBackdropStatus');if(node){node.textContent=text;node.dataset.error=String(isError);}};
  function select(value,name){
    selected=value;
    selectedName=name || (library.find(i=>i.id===value)?.name||'CUSTOM BACKGROUND');
    const img=$('dmBackdropPreview');
    const src=director.getImageSrc(value);
    if(img&&src)img.src=src;
    if($('dmBackdropName'))$('dmBackdropName').textContent=selectedName;
    if($('dmBackdropSceneNote'))$('dmBackdropSceneNote').textContent=`Ready to apply to ${sceneControl.value.toUpperCase()}`;
    gallery.querySelectorAll('[data-bg-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bgId===selected)));
  }
  function displayGallery(){
    const frag=document.createDocumentFragment();
    for(const item of library){
      const button=document.createElement('button');button.type='button';button.dataset.bgId=item.id;
      const img=document.createElement('img');img.src=item.thumb;img.alt='';img.loading='lazy';
      const label=document.createElement('small');label.textContent=item.name;
      const season=document.createElement('em');season.textContent=item.season;
      button.setAttribute('aria-label',`${item.name} (${item.season})`);
      button.append(img,label,season);
      button.addEventListener('click',()=>select(item.id,item.name));
      frag.appendChild(button);
    }
    gallery.replaceChildren(frag);
    select(selected);
  }
  function refresh(){
    const state=director.getState();
    const currentScene=sceneControl.value;
    if(!selected)selected=state.backgrounds[currentScene];
    for(const b of document.querySelectorAll('[data-dm-time]'))b.dataset.selected=String(b.dataset.dmTime===(state.timeOfDay||document.body.dataset.timeOfDay));
    for(const b of document.querySelectorAll('[data-dm-weather]'))b.dataset.selected=String(b.dataset.dmWeather===(state.weather||document.body.dataset.weather));
  }
  function failed(action,error){
    status(`${action} FAILED · ${error?.message||'Unknown error'}`,true);
    console.warn('Scene director',action,error);
  }
  async function action(label,job){
    if(!hasDMRole()){status('TRUSTED DIRECTOR MODE REQUIRED',true);return;}
    try{await job();status(`${label} · Sent to desktop / TV`);refresh();}
    catch(error){failed(label,error);}
  }
  sceneControl.addEventListener('change',()=>select(director.getState().backgrounds[sceneControl.value]));
  $('dmBackdropApply')?.addEventListener('click',()=>action('BACKGROUND APPLIED',()=>director.setBackground(sceneControl.value,selected)));
  $('dmBackdropApplyAll')?.addEventListener('click',()=>action('ALL SCENES UPDATED',()=>director.setAllBackgrounds(selected)));
  $('dmBackdropReset')?.addEventListener('click',()=>action('SCENE DEFAULT RESTORED',()=>director.resetBackground(sceneControl.value)));
  $('dmBackdropRandom')?.addEventListener('click',()=>{
    const pool=library.filter(item=>item.id!==selected);
    const next=pool[Math.floor(Math.random()*pool.length)];
    if(next){select(next.id,next.name);status('RANDOM BACKGROUND SELECTED · Press APPLY to publish');}
  });
  $('dmBackdropFile')?.addEventListener('change',async event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){status('IMAGE MUST BE JPG/PNG/WEBP AND UNDER 12 MB',true);event.target.value='';return;}
    status('OPTIMIZING IMAGE…');
    let bitmap;
    try{
      bitmap=await createImageBitmap(file);
      let size=1100, quality=.74, result='';
      for(let i=0;i<8;i++){
        const scale=Math.min(1,size/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(bitmap.width*scale));
        canvas.height=Math.max(1,Math.round(bitmap.height*scale));
        canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
        result=canvas.toDataURL('image/webp',quality);
        if(result.length<=190000)break;
        size=Math.max(500,Math.floor(size*.83));quality=Math.max(.44,quality-.06);
      }
      if(result.length>190000)throw new Error('Could not compress to the synchronized image limit.');
      select(result,file.name.replace(/\.[^.]+$/,'').slice(0,50));
      status('CUSTOM IMAGE READY · Press APPLY to publish');
    }catch(error){failed('UPLOAD',error);}
    finally{bitmap?.close?.();event.target.value='';}
  });
  for(const button of document.querySelectorAll('[data-dm-time]'))button.addEventListener('click',()=>action('LIGHTING UPDATED',()=>director.setAtmosphere({timeOfDay:button.dataset.dmTime})));
  for(const button of document.querySelectorAll('[data-dm-weather]'))button.addEventListener('click',()=>action('WEATHER UPDATED',()=>director.setAtmosphere({weather:button.dataset.dmWeather})));
  const templates={
    location:{kind:'location',title:'A NEW PART OF BOSTON',body:'A new location comes into view.'},
    intermission:{kind:'announcement',title:'INTERMISSION',body:'The story will continue shortly.'},
    danger:{kind:'boss',title:'THREAT DETECTED',body:'Prepare for the next encounter.'},
    victory:{kind:'victory',title:'VICTORY',body:'Against the odds, the party survives.'},
    idle:{kind:'idle',title:'THE WOUNDED ETERNITY',body:'The stage is standing by.'}
  };
  let chosenKind='announcement';
  document.querySelectorAll('[data-dm-stage-preset]').forEach(button=>button.addEventListener('click',()=>{
    const item=templates[button.dataset.dmStagePreset];if(!item)return;
    chosenKind=item.kind;
    $('dmQuickStageTitle').value=item.title;$('dmQuickStageBody').value=item.body;
    document.querySelectorAll('[data-dm-stage-preset]').forEach(b=>b.dataset.selected=String(b===button));
    status('STAGE PRESET LOADED · Use UPDATE STAGE or UPDATE + TAKE LIVE');
  }));
  async function updateStage(broadcast=false){
    await action(broadcast?'STAGE ON AIR':'STAGE UPDATED',async()=>{
      const title=$('dmQuickStageTitle').value.trim().slice(0,160)||'THE WOUNDED ETERNITY';
      const body=$('dmQuickStageBody').value.trim().slice(0,1200)||'The stage is standing by.';
      await window.SoulSeekerStage.setStage({kind:chosenKind,title,body,subtitle:'BOSTON // ACT III',imageUrl:'',characterId:''});
      if(broadcast)await window.SoulSeekerSession.broadcastScene('stage',$('dmTransitionSelect')?.value||'ink');
    });
  }
  $('dmQuickStageSave')?.addEventListener('click',()=>void updateStage(false));
  $('dmQuickStageLive')?.addEventListener('click',()=>void updateStage(true));
  window.addEventListener('soulseekers:scenerystate',refresh);
  window.addEventListener('soulseekers:sessionstate',refresh);
  window.addEventListener('soulseekers:viewchange',refresh);
  displayGallery();refresh();
}
