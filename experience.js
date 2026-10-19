import { chatMessageElements } from "./chatThread.js";
/* V37 charm + usability composition. V35 systems preserved. No Firebase listeners or media engines. */
const $=id=>document.getElementById(id);
const phone=matchMedia('(max-width:720px), (max-height:540px) and (pointer:coarse)');
const tv=new URLSearchParams(location.search).get('tv')==='1';
const make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;};
const toast=make('div','session-toast');toast.setAttribute('role','status');document.body.append(toast);let toastTimer;
window.addEventListener('soulseekers:toast',e=>{toast.textContent=e.detail?.message||'';toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),4000);});
function notify(message){window.dispatchEvent(new CustomEvent('soulseekers:toast',{detail:{message}}));}
// Desktop transmission log: keep the empty state inside the actual thread so the chat always reads as a chat.
if(!phone.matches&&!tv){
 const chat=$('chatMessages');
 const threadRail=make('div','terminal-thread-rail');
 threadRail.innerHTML='<span><i></i> TRANSMISSION LOG</span><b id="terminalMessageCount">0 SIGNALS</b>';
 chat.before(threadRail);
 // A local-only operator ident: purely visual, never broadcast or persisted.
 // Observer remains an open channel; six existing portrait assets supply the
 // identities. Nothing here changes the sender or the Firestore payload.
 const operator=make('aside','terminal-operator');
 operator.setAttribute('aria-label','Current chat identity');
 operator.innerHTML=`<div class="operator-portrait"><img alt="" decoding="async" hidden><span aria-hidden="true">◈</span></div><div class="operator-copy"><span class="operator-kicker">TRANSMITTING AS // LOCAL IDENTITY</span><strong class="operator-name">OBSERVER</strong><span class="operator-note">MONITORING THE PARTY FREQUENCY</span></div><div class="operator-channel" aria-hidden="true"><b>SS / III</b><span>◢ 06</span><i></i><i></i><i></i></div>`;
 threadRail.before(operator);
 const operatorPortrait=operator.querySelector('img');
 const operatorSeal=operator.querySelector('.operator-portrait span');
 const portraitFiles={Max:'max.webp',Jeanette:'jeanette.webp',Magnus:'magnus.webp',Asya:'asya.webp',Alexandria:'alexandria.webp',Fitz:'fitz.webp'};
 const roles={
   Max:'JUST BUSINESS // CONNECTION ESTABLISHED',
   Jeanette:'SAY CHEESE // SHUTTER ONLINE',
   Magnus:'RENAÎTRE // SIGNAL RETURNED',
   Asya:'print("HelloWorld") // SIGNAL ONLINE',
   Alexandria:'CHECKMATE // POSITION VERIFIED',
   Fitz:'I MIGHT HAVE THE COMPOUND // STANDING BY'
 };
 function paintOperator(){
   const name=$('currentUserSelect').value;
   const file=portraitFiles[name];
   operator.dataset.operative=name.toLowerCase();
   operator.querySelector('.operator-name').textContent=name.toUpperCase();
   operator.querySelector('.operator-note').textContent=roles[name]||'MONITORING THE PARTY FREQUENCY';
   operator.querySelector('.operator-kicker').textContent=name==='Observer'?'OPEN CHANNEL // RECEIVING ALL SIGNALS':'TRANSMITTING AS // LOCAL IDENTITY';
   operatorPortrait.hidden=!file;
   operatorSeal.hidden=Boolean(file);
   if(file)operatorPortrait.src=`assets/characters/${file}`;
   else operatorPortrait.removeAttribute('src');
 }
 $('currentUserSelect').addEventListener('change',paintOperator);
 paintOperator();
 const empty=make('div','terminal-empty');
 empty.innerHTML='<span class="empty-index">01 / RADIO SILENCE</span><h2>No voices<br><em>on the wire.</em></h2><p>Your group thread is live. Pick a character below and send the first transmission.</p><span class="empty-rule">BOSTON · PARTY FREQUENCY 06</span>';
 chat.append(empty);
 const updateEmpty=()=>{const count=chatMessageElements(chat).length;empty.hidden=count>0;const label=$('terminalMessageCount');if(label)label.textContent=`${count} ${count===1?'SIGNAL':'SIGNALS'}`;};
 new MutationObserver(updateEmpty).observe(chat,{childList:true});updateEmpty();
 const tabs=[...document.querySelectorAll('.desktop-tab')];
 tabs.forEach((tab,i)=>{tab.dataset.index=String(i+1).padStart(2,'0');tab.tabIndex=i? -1:0;});
 document.querySelector('.desktop-tabs').addEventListener('keydown',event=>{const index=tabs.indexOf(event.target);if(index<0)return;let next=index;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();tabs[next].click();});
 window.addEventListener('soulseekers:viewchange',()=>{tabs.forEach(tab=>tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1);});
 // Recompose the existing director elements. Their IDs and all existing handlers survive.
 const dashboard=$('dmControlDashboard'), primary=document.querySelector('.dm-director-primary'), grid=document.querySelector('.dm-panel-grid');
 const panels=[...grid.children];
 const nav=make('nav','director-workspaces');nav.setAttribute('aria-label','Director workspaces');
 const names=['Scene lab','Encounter','Sound desk','Cue studio','Session'];
 function selectPanel(index){panels.forEach((panel,i)=>{panel.hidden=i!==index;panel.open=i===index;});[...nav.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
 panels.forEach((panel,i)=>{const button=make('button','workspace-button',names[i]);button.type='button';button.addEventListener('click',()=>selectPanel(i));nav.append(button);});
 const workbench=make('div','director-workbench');
 const soundDeck=document.querySelector('.dm-sfx-console');
 if(soundDeck){
   const soundDock=make('section','director-sound-dock');
   const soundDockLabel=make('div','sound-dock-label');
   soundDockLabel.innerHTML='<span>LIVE AUDIO // QUICK ACCESS</span><strong>SOUND DECK</strong><em>TV</em>';
   soundDock.append(soundDockLabel,soundDeck);
   workbench.append(soundDock);
 }
 workbench.append(nav,grid);dashboard.append(workbench);selectPanel(0);
 const monitor=make('aside','director-monitor');
 const monitorHeader=make('div','monitor-label','PROGRAM / PLAYER DISPLAY');
 const liveStatus=make('span','monitor-status','LOCAL PREVIEW');liveStatus.id='directorHealth';monitorHeader.append(liveStatus);
 const preview=$('dmPreviewScreen');
 const tally=make('div','director-tally');tally.innerHTML='<div><span>ON AIR</span><strong id="tallyScene">TERMINAL</strong></div><div><span>ACTIVE TURN</span><strong id="tallyTurn">STANDING BY</strong></div><div><span>MUSIC CUE</span><strong id="tallyTrack">PAUSED</strong></div>';
 const launch=make('button','monitor-launch','OPEN PLAYER TV ↗');launch.type='button';launch.addEventListener('click',()=>$('dmOpenTv').click());
 const hint=make('p','director-shortcuts','SPACE  Next turn · ALT 1 / 2 / 3  Broadcast · ALT B  Blackout');
 monitor.append(monitorHeader,preview,tally,launch,hint);dashboard.prepend(monitor);
 const stateUpdate=(state)=>{if(!state)return;$('tallyScene').textContent=state.broadcast.blackout?'BLACKOUT':state.broadcast.scene.toUpperCase();document.querySelectorAll('[data-dm-broadcast]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dmBroadcast===state.broadcast.scene&&!state.broadcast.blackout)));const tracks=window.SoulSeekerMusic?.getTracks()||[];$('tallyTrack').textContent=state.audio.playing?(tracks.find(t=>t.id===state.audio.trackId)?.title||'PLAYING'):'PAUSED';};
 window.addEventListener('soulseekers:sessionstate',e=>stateUpdate(e.detail));
 window.addEventListener('soulseekers:combatstate',e=>{$('tallyTurn').textContent=e.detail.encounter.activeId?`${e.detail.encounter.activeId} / R${e.detail.encounter.round}`:'STANDING BY';});
 window.addEventListener('soulseekers:sessionhealth',e=>{$('directorHealth').textContent=e.detail.connected?'LIVE FIREBASE':(e.detail.message||'OFFLINE');});
 // Presets fill the existing form; only the existing explicit fire button broadcasts.
 const presets=make('div','cue-presets');presets.setAttribute('aria-label','Cue templates');
 const templates=[['Dialogue',{kind:'dialogue',title:'Asya',characterId:'Asya',body:'print("HelloWorld")'}],['Chapter',{kind:'chapter',title:'THE CITY REMEMBERS',subtitle:'ACT III / THE NEXT MOVEMENT',body:'',characterId:''}],['Boss',{kind:'boss',title:'THE UNINVITED',subtitle:'AN IMPOSSIBLE PRESENCE',body:'Something has crossed the threshold.',characterId:'',atmosphere:'ominous'}],['Victory',{kind:'victory',title:'STILL HERE.',subtitle:'ENCOUNTER RESOLVED',body:'For one more night, the city is yours.',characterId:'',atmosphere:'victory'}]];
 templates.forEach(([name,cue])=>{const b=make('button','cue-preset',name);b.type='button';b.addEventListener('click',()=>{const ids={kind:'dmCueKind',title:'dmCueTitle',subtitle:'dmCueSubtitle',body:'dmCueBody',characterId:'dmCueCharacter',atmosphere:'dmCueAtmosphere'};Object.entries(ids).forEach(([key,id])=>$(id).value=cue[key]||({kind:'announcement',atmosphere:'quiet'}[key]||''));$('dmCueImage').value='';$('dmCueTitle').focus();});presets.append(b);});document.querySelector('.dm-cue-builder').prepend(presets);
 const cuePreview=make('div','cue-rehearsal');cuePreview.innerHTML='<span>PREVIEW / NOT ON AIR</span><h3></h3><p></p>';document.querySelector('.dm-cue-builder').prepend(cuePreview);
 function rehearse(){cuePreview.dataset.kind=$('dmCueKind').value;cuePreview.querySelector('h3').textContent=$('dmCueTitle').value||'Your next moment.';cuePreview.querySelector('p').textContent=$('dmCueBody').value||'Compose a cue below, then send it to the room.';}
 document.querySelector('.dm-cue-builder').addEventListener('input',rehearse);presets.addEventListener('click',rehearse);rehearse();
 // Separate local UI feedback from player-facing effects.
 const uiSetting=make('label','dm-check');const uiCheck=document.createElement('input');uiCheck.type='checkbox';uiCheck.checked=localStorage.getItem('soulSeekersUiSfxV34')!=='0';uiCheck.addEventListener('change',()=>window.SoulSeekerSFX?.setUiEnabled(uiCheck.checked));uiSetting.append(uiCheck,document.createTextNode('Local interface sounds'));document.querySelector('.dm-sfx-settings').append(uiSetting);
 stateUpdate(window.SoulSeekerSession?.getState());
}
// Dialog focus containment and return, including the dynamically generated order editor.
for(const id of ['combatEditor','combatOrderEditor']){const dialog=$(id);let previous;
 new MutationObserver(()=>{if(!dialog.hidden){previous=document.activeElement;dialog.querySelector('input,button,select')?.focus({preventScroll:true});}else if(previous?.isConnected)previous.focus({preventScroll:true});}).observe(dialog,{attributes:true,attributeFilter:['hidden']});
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
}
// Suppress off-screen CSS animation without stopping state listeners or audio.
function visibility(){document.body.classList.toggle('render-suspended',document.hidden);}document.addEventListener('visibilitychange',visibility);visibility();

window.addEventListener("pageshow",event=>{if(event.persisted)location.reload();});
