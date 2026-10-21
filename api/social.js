// Adaptador para um provedor de feed autorizado, a escolher com a Unida.
// Os endpoints precisam retornar o contrato descrito em docs/INTEGRACOES.md.
// Nunca enviar token da conta para o frontend nem usar scraping de perfis.
export default async function handler(req,res){
  res.setHeader('Cache-Control','private, no-store');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({status:'error',code:'method_not_allowed'});}
  const source=req.query.source;
  if(source!=='instagram'&&source!=='reviews')return res.status(400).json({status:'error',code:'invalid_source'});
  const prefix=source==='instagram'?'UNIDA_INSTAGRAM':'UNIDA_REVIEWS';
  const endpoint=process.env[prefix+'_FEED_URL'];
  if(!endpoint)return res.status(503).json({status:'unconfigured',source,items:[]});
  try{
    const url=new URL(endpoint);if(url.protocol!=='https:')throw new Error('Endpoint precisa ser HTTPS.');
    const headers={Accept:'application/json'};const token=process.env[prefix+'_FEED_TOKEN'];if(token)headers.Authorization='Bearer '+token;
    const upstream=await fetch(url,{headers,signal:AbortSignal.timeout(6000),redirect:'error'});
    if(!upstream.ok)return res.status(502).json({status:'error',code:'provider_unavailable',source});
    const raw=await upstream.text();if(raw.length>500000)throw new Error('Resposta excessiva.');
    const data=JSON.parse(raw);if(data.status!=='success'||!Array.isArray(data.items))throw new Error('Contrato inválido.');
    const text=(v,n=500)=>String(v||'').slice(0,n);
    let items=data.items.slice(0,50).map(item=>source==='instagram'?{permalink:text(item.permalink,2000),thumbnailUrl:text(item.thumbnailUrl,3000),caption:text(item.caption),publishedAt:text(item.publishedAt,60)}:{authorName:text(item.authorName,150),rating:Number(item.rating),text:text(item.text),sourceUrl:text(item.sourceUrl,2000),createdAt:text(item.createdAt,60)});
    const date=source==='instagram'?'publishedAt':'createdAt';items=items.filter(i=>Number.isFinite(Date.parse(i[date]))).sort((a,b)=>Date.parse(b[date])-Date.parse(a[date]));
    // Filter text-only reviews before limiting, so empty star ratings don't replace comments.
    if(source==='reviews')items=items.filter(i=>i.text);
    const result={status:'success',source,items:items.slice(0,3)};
    if(source==='reviews'&&Number.isFinite(data.averageRating)&&Number.isInteger(data.totalReviewCount)){result.averageRating=data.averageRating;result.totalReviewCount=data.totalReviewCount;}
    return res.status(200).json(result);
  }catch{return res.status(502).json({status:'error',source,code:'provider_unavailable'});}
}
