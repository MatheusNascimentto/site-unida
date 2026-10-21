import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const source=app.slice(app.lastIndexOf('(() => {'));
async function scenario(mobile,blocked=false){
 const events={},pageEvents={},attrs={},buttonAttrs={};let observer,playCount=0;
 const glyph={setAttribute(k,v){attrs[k]=v;}},label={textContent:''};
 const button={querySelector:s=>s==='[data-video-label]'?label:glyph,setAttribute(k,v){buttonAttrs[k]=v;},addEventListener(k,f){events['button:'+k]=f;}};
 const video={paused:true,src:'',getAttribute(){return '/assets/hero-escritorio-mobile.mp4';},setAttribute(){},load(){},addEventListener(k,f){events[k]=f;},play(){playCount++;if(blocked)return Promise.reject(new Error('NotAllowedError'));this.paused=false;events.playing?.();return Promise.resolve();},pause(){this.paused=true;events.pause?.();}};
 const document={hidden:false,querySelector:s=>s==='#hero-background-video'?video:s==='.hero-video-toggle'?button:s==='.hero-photo'?{classList:{add(){},remove(){}}}:{},addEventListener(k,f){pageEvents[k]=f;}};
 const sandbox={document,matchMedia:()=>({matches:mobile}),window:{IntersectionObserver:true},IntersectionObserver:class{constructor(f){observer=f;}observe(){}},addEventListener(){}};
 vm.runInNewContext(source,sandbox);const settle=()=>new Promise(resolve=>setImmediate(resolve));await settle();
 assert.equal(video.muted,true);assert.equal(video.playsInline,true);assert.equal(playCount,1);
 if(blocked){assert.equal(video.paused,true);blocked=false;pageEvents.touchend({target:{closest:()=>null}});await settle();assert.equal(video.paused,false);}
 else assert.equal(video.paused,false);
 assert.equal(attrs.d,'M7 5h3v14H7zM14 5h3v14h-3z');
 events['button:click']();assert.equal(video.paused,true);assert.equal(attrs.d,'M8 5v14l11-7z');
 pageEvents.touchend({target:{closest:()=>null}});await settle();assert.equal(video.paused,true,'Uma pausa escolhida pelo usuário deve ser preservada');
 events['button:click']();await settle();assert.equal(video.paused,false);
 observer([{isIntersecting:false}]);assert.equal(video.paused,true);
 observer([{isIntersecting:true}]);await settle();assert.equal(video.paused,false);
 document.hidden=true;pageEvents.visibilitychange();assert.equal(video.paused,true);
 document.hidden=false;pageEvents.visibilitychange();await settle();assert.equal(video.paused,false);
 if(!mobile)assert.equal(video.src,'/assets/hero-escritorio.mp4');
}
await scenario(true);await scenario(false);await scenario(true,true);
console.log('OK: autoplay silencioso, ícones SVG, pausa manual, retorno à tela e recuperação após bloqueio. Teste simulado; não substitui Safari em aparelho real.');
