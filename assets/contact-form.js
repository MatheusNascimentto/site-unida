// The only destination is the public business WhatsApp. Personal field values
// never go to analytics, storage, an email service or a site API.
const interests = {abrir:'Abrir uma empresa',trocar:'Trocar de contador',cuidar:'Cuidar da minha empresa',outro:'Outro assunto'};
const clean = (value,limit) => String(value || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim().slice(0,limit);
export function createContactUrl(fields) {
  const name=clean(fields.name,100).replace(/\s+/g,' ');
  const message=clean(fields.message,1200);
  if(name.length<2||message.length<10||!interests[fields.interest])throw new Error('Preencha nome, assunto e mensagem.');
  const phone=clean(fields.phone,25).replace(/[\r\n]/g,' ');
  const email=clean(fields.email,160).replace(/[\r\n]/g,' ');
  const text=[`Olá, Unida! Meu nome é ${name}.`,`Assunto: ${interests[fields.interest]}`,phone?`Telefone: ${phone}`:'',email?`E-mail: ${email}`:'','',message].filter((line,i)=>line||i===4).join('\n');
  return 'https://wa.me/5515997996473?text='+encodeURIComponent(text);
}
if(typeof document!=='undefined') {
 document.querySelectorAll('[data-contact-form]').forEach(form=>{
   form.hidden=false;
   const status=form.querySelector('.contact-form-status');
   form.addEventListener('submit',event=>{
     if(!form.checkValidity()){event.preventDefault();form.reportValidity();return;}
     try{
       const fields=Object.fromEntries([...form.querySelectorAll('[data-field]')].map(field=>[field.dataset.field,field.value]));
       const url=new URL(createContactUrl(fields));
       form.querySelector('[data-whatsapp-message]').value=url.searchParams.get('text');
       if(status)status.textContent='Mensagem preparada. Confira e confirme o envio no WhatsApp.';
       document.dispatchEvent(new Event('unida:contact-form'));
       // Native GET submission opens WhatsApp in a new tab. Only the hidden text
       // input has a name, so no duplicate personal parameters are appended.
     }catch(error){event.preventDefault();if(status)status.textContent=error.message;}
   });
 });
}
