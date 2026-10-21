import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const start=app.indexOf('  // Analytics is optional.');
const end=app.indexOf("  document.addEventListener('click', event => {",start);
assert.ok(start>=0&&end>start);
const source=app.slice(start,end);
function harness(id='',cache=new Map()){
 const scripts=[],panels=[],expired=[];let now=Date.now();
 const preferenceButton={hidden:true,addEventListener(){},focus(){}};
 const info={textContent:''},settings={hidden:true};
 const document={activeElement:preferenceButton,head:{append(script){scripts.push(script);}},body:{append(aside){panels.push(aside);}},createElement(tag){
   if(tag==='script')return {dataset:{}};
   const aside={className:'',setAttribute(){},remove(){panels.splice(panels.indexOf(aside),1);},buttons:[]};
   aside.buttons=['denied','granted'].map(choice=>({dataset:{consent:choice},addEventListener(type,handler){this.handler=handler;},focus(){}}));return aside;
 }};
 Object.defineProperty(document,'cookie',{get(){return '_ga=example; _ga_TEST=example; session=keep';},set(value){expired.push(value);}});
 const sandbox={cfg:{ga4MeasurementId:id},stored:key=>cache.get(key)||null,save:(key,value)=>cache.set(key,value),window:{},document,location:{origin:'https://unida.example',hostname:'unida.example',pathname:'/contato/',search:'?message=private&utm_source=teste'},URL,URLSearchParams,Date:class extends Date{static now(){return now;}}};
 sandbox.$=selector=>selector==='script[data-unida-analytics]'?scripts[0]||null:selector==='.consent-panel'?panels[0]||null:selector==='[data-analytics-settings]'?settings:selector==='[data-analytics-info]'?info:selector==='[data-consent="denied"]'?panels.at(-1)?.buttons[0]:null;
 sandbox.$$=(selector,scope)=>selector==='[data-consent-reset]'?[preferenceButton]:selector==='[data-consent]'?scope.buttons:[];
 const context=vm.createContext(sandbox);vm.runInContext(source,context);
 return {context,cache,scripts,panels,expired,sandbox,settings,info,preferenceButton,advance(days){now+=days*86400000;}};
}
const off=harness();assert.equal(off.scripts.length,0);assert.equal(off.panels.length,0);assert.equal(off.cache.size,0);assert.equal(off.preferenceButton.hidden,true);assert.equal(off.settings.hidden,true);
const enabled=harness('G-TEST123');assert.equal(enabled.scripts.length,0);assert.equal(enabled.panels.length,1);
enabled.panels[0].buttons[0].handler();assert.equal(enabled.scripts.length,0);assert.equal(vm.runInContext('analyticsConsent()',enabled.context),'denied');assert.equal(enabled.sandbox.window['ga-disable-G-TEST123'],true);assert.ok(enabled.expired.every(cookie=>cookie.startsWith('_ga')));
vm.runInContext('consentPrompt(true)',enabled.context);enabled.panels[0].buttons[1].handler();assert.equal(enabled.scripts.length,1);assert.equal(enabled.sandbox.window['ga-disable-G-TEST123'],false);
const configCall=enabled.sandbox.window.dataLayer.find(args=>args[0]==='config');assert.equal(configCall[2].page_location,'https://unida.example/contato/?utm_source=teste');assert.ok(!JSON.stringify(enabled.sandbox.window.dataLayer).includes('private'));
vm.runInContext('consentPrompt(true)',enabled.context);enabled.panels[0].buttons[0].handler();assert.equal(enabled.sandbox.window['ga-disable-G-TEST123'],true);assert.equal(enabled.scripts.length,1);
const restored=harness('G-TEST123',enabled.cache);assert.equal(restored.panels.length,0);assert.equal(restored.scripts.length,0);
enabled.advance(181);assert.equal(vm.runInContext('analyticsConsent()',enabled.context),null);
const changed=harness('G-OTHER123',enabled.cache);assert.equal(changed.scripts.length,0);assert.equal(changed.panels.length,1);
console.log('OK: sem GA não há banner/rastreio; recusa, aceite, revogação, expiração e mudança de propriedade verificados.');
