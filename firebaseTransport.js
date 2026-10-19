/* V35 transport boundary. PHCode/localhost is intentionally isolated from cloud writes.
   ?cloud=1 opts into the supplied real Firebase project for acceptance testing. */
const params = new URLSearchParams(location.search);
export const localTransport = params.get('cloud') !== '1' && (['localhost','127.0.0.1','[::1]'].includes(location.hostname) || params.get('phcodeLivePreview') === 'true' || params.get('local') === '1');
const unavailable = () => Object.assign(new Error('Local preview uses browser synchronization.'), {code:'soulseekers/local-preview'});
const local = {
 initializeApp:(config,name)=>({name,config}),getFirestore:()=>({}),getAuth:()=>({currentUser:null}),
 doc:(_db,...path)=>({path:path.join('/')}),collection:(_db,...path)=>({path:path.join('/')}),
 query:(ref,...constraints)=>({...ref,constraints}),orderBy:(...args)=>args,limit:n=>n,
 serverTimestamp:()=>new Date().toISOString(),
 getDoc:async()=>{throw unavailable()},setDoc:async()=>{throw unavailable()},addDoc:async()=>{throw unavailable()},
 onSnapshot:(_ref,_next,error)=>{let active=true;queueMicrotask(()=>{if(active)error?.(unavailable())});return()=>{active=false}},
 setPersistence:async()=>{},signInAnonymously:async()=>({user:null}),onAuthStateChanged:()=>()=>{},
 browserLocalPersistence:{},inMemoryPersistence:{}
};
const sdk = localTransport ? local : Object.assign({}, ...await Promise.all([
 import('https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js'),
 import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'),
 import('https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js')
]));
export const {initializeApp,getFirestore,getAuth,doc,collection,query,orderBy,limit,serverTimestamp,getDoc,setDoc,addDoc,onSnapshot,setPersistence,signInAnonymously,onAuthStateChanged,browserLocalPersistence,inMemoryPersistence}=sdk;
