/* Soul Seekers shared Firebase bootstrap (v34).
   TRUSTED TABLE MODE: no email/password login is required.
   Every normal desktop client signs in anonymously and automatically claims its
   own lightweight DM role record. TV clients use a separate in-memory anonymous
   session and never auto-claim DM access.

   This keeps the DM/TV data boundary working during normal use while matching the
   table's trust model: anyone who opens the normal desktop site is intentionally
   treated as a trusted director. */
import { initializeApp } from "./firebaseTransport.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "./firebaseTransport.js";
import {
  getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence,
  signInAnonymously, onAuthStateChanged
} from "./firebaseTransport.js";

const firebaseConfig = {
  apiKey: "AIzaSyAsOosEU05SX5MU-mxEQ5FvhFeJvTjQaQ8",
  authDomain: "group-chat-e19f8.firebaseapp.com",
  projectId: "group-chat-e19f8",
  storageBucket: "group-chat-e19f8.firebasestorage.app",
  messagingSenderId: "1085864086659",
  appId: "1:1085864086659:web:de378f1efe80bc9a0b1fb6",
  measurementId: "G-93G3VWHRY4"
};

import { localTransport } from './firebaseTransport.js';
const phoneClient = matchMedia('(max-width: 720px), (max-height: 540px) and (pointer: coarse)').matches;
const pageParams = new URLSearchParams(location.search);
export const isTvClient = pageParams.get('tv') === '1';
export const isLocalPreview = localTransport;
// The TV deliberately uses a named Firebase app and in-memory anonymous Auth.
// This prevents it from inheriting the persistent anonymous director identity
// used by the laptop, even when both are opened in the same browser profile.
export const app = isTvClient ? initializeApp(firebaseConfig, 'soulseekers-tv') : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let roleState = { user:null, dm:!isTvClient && !phoneClient && isLocalPreview, roleChecked:!isTvClient && !phoneClient && isLocalPreview, authError:null, trustedMode:true, localPreview:isLocalPreview };
const roleListeners = new Set();
let bootstrapComplete = false;

function emitRole(){
  const snapshot={...roleState};
  for(const listener of roleListeners){try{listener(snapshot);}catch(error){console.error('Role listener failed',error);}}
  window.dispatchEvent(new CustomEvent('soulseekers:auth',{detail:snapshot}));
}

async function ensureGuestAuth(){
  try{await setPersistence(auth,isTvClient?inMemoryPersistence:browserLocalPersistence);}catch(error){console.warn('Firebase Auth persistence unavailable',error);}
  if(auth.currentUser)return auth.currentUser;
  try{return (await signInAnonymously(auth)).user;}
  catch(error){
    roleState={...roleState,user:null,dm:(!isTvClient && !phoneClient && isLocalPreview),roleChecked:true,authError:error,localPreview:isLocalPreview};
    console.warn('Anonymous Firebase Auth is required for Soul Seekers v34 cloud sync.',error?.code||error);
    emitRole();
    return null;
  }
}

async function checkRole(user){
  if (isLocalPreview && !isTvClient && !phoneClient) { roleState={...roleState,user,dm:true,roleChecked:true,authError:null,localPreview:true};emitRole();return roleState; }
  roleState={...roleState,user,dm:false,roleChecked:false,authError:null,localPreview:isLocalPreview};emitRole();
  if(!user){roleState={...roleState,roleChecked:true};emitRole();return roleState;}
  if(isTvClient || phoneClient){
    // TV/player-display clients never auto-enroll as directors.
    roleState={...roleState,dm:false,roleChecked:true,authError:null};emitRole();return roleState;
  }
  try{
    const snap=await getDoc(doc(db,'roles',user.uid));
    roleState={...roleState,dm:snap.exists()&&snap.data()?.dm===true,roleChecked:true,authError:null};
  }catch(error){roleState={...roleState,dm:false,roleChecked:true,authError:error};}
  emitRole();return roleState;
}

async function ensureTrustedDesktopRole(user){
  if (isLocalPreview && !isTvClient && !phoneClient) { roleState={...roleState,user:user||null,dm:true,roleChecked:true,authError:null,localPreview:true};emitRole();return roleState; }
  if(!user || isTvClient || phoneClient) return checkRole(user);
  roleState={...roleState,user,dm:false,roleChecked:false,authError:null};emitRole();
  try{
    const ref=doc(db,'roles',user.uid);
    const snap=await getDoc(ref);
    if(!snap.exists() || snap.data()?.dm!==true || snap.data()?.mode!=='trusted-desktop'){
      await setDoc(ref,{dm:true,mode:'trusted-desktop',updatedAt:serverTimestamp()},{merge:true});
    }
    roleState={...roleState,user,dm:true,roleChecked:true,authError:null};
  }catch(error){
    roleState={...roleState,user,dm:false,roleChecked:true,authError:error};
    console.warn('Trusted DM auto-enrollment failed. Publish the v34 Firestore rules.',error?.code||error);
  }
  emitRole();return roleState;
}

export const authReady=(async()=>{
  const user=await ensureGuestAuth();
  if(user){
    if(isTvClient || phoneClient) await checkRole(user);
    else await ensureTrustedDesktopRole(user);
  }
  bootstrapComplete=true;
  return user;
})();

onAuthStateChanged(auth,user=>{
  if(!bootstrapComplete)return;
  if(isTvClient) void checkRole(user);
  else void ensureTrustedDesktopRole(user);
});

export function getRoleState(){return {...roleState};}
export function hasDMRole(){return roleState.dm===true;}
export function onRoleChange(listener){roleListeners.add(listener);listener({...roleState});return()=>roleListeners.delete(listener);}

// Compatibility helpers retained for older modules/extensions. There is no
// credential prompt in v32; calling signInDM simply ensures trusted enrollment.
export async function signInDM(){
  const user=await authReady.catch(()=>null) || await ensureGuestAuth();
  if(user && !isTvClient) await ensureTrustedDesktopRole(user);
  return user;
}
export async function signOutDM(){
  // Trusted-table mode intentionally has no sign-out concept. The desktop stays
  // a director; use ?tv=1 for a player display with no DM role.
  return auth.currentUser;
}
export async function refreshRole(){
  if(isTvClient) return checkRole(auth.currentUser);
  return ensureTrustedDesktopRole(auth.currentUser);
}
