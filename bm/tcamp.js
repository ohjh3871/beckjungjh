(async()=>{
if(!/shopping-seller\.toss\.im$/.test(location.host)){alert('토스쇼핑 파트너스(shopping-seller.toss.im) 화면에서 눌러주세요.');return;}
const cidM=location.pathname.match(/\/promotion\/campaigns\/(\d+)/);
if(!cidM){alert('신청할 기획전 화면(프로모션 → 판매 캠페인 → 기획전 하나를 연 화면)에서 눌러주세요.');return;}
const CID=Number(cidM[1]);
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap;max-height:80vh;overflow:auto';document.body.append(box);
const say=t=>{box.textContent=t;};
const close=()=>{const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);};
const copyBtn=(payload,copied)=>{const bt=document.createElement('button');bt.style.cssText='display:block;margin-top:12px;background:#facc15;color:#111;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:15px';const ok=()=>{bt.textContent='✔ 기획전 상품 목록(BJTCP1) 복사됨 — 관리 사이트 [상품 관리 → 토스 → 기획전 신청] 칸에 붙여넣기만 하면 돼요';bt.style.background='#86efac';};
  let done=copied;const tryCopy=async()=>{if(done)return;try{await navigator.clipboard.writeText(payload);done=true;ok();}catch(e){}};
  if(copied)ok();else{bt.textContent='📋 기획전 상품 목록 복사 (이 화면을 누르면 자동 복사돼요)';const iv=setInterval(()=>{if(done){clearInterval(iv);return;}if(document.hasFocus())tryCopy();},700);window.addEventListener('focus',tryCopy);document.addEventListener('pointerdown',tryCopy,true);setTimeout(()=>clearInterval(iv),30*60000);}
  bt.onclick=async()=>{done=false;await tryCopy();};box.append(bt);};
const H={'x-merchant-id':'46627','x-merchant-user-id':'80697','x-toss-frontend-service':'shopping-seller-toss-im'};
const API='https://api-public.toss.im/api-public';
const J=async(url,opt)=>{let j=null;for(let k=0;k<3&&!j;k++){try{const r=await fetch(url,Object.assign({credentials:'include'},opt||{},{headers:Object.assign({},H,(opt&&opt.body)?{'Content-Type':'application/json'}:{})}));if(r.ok)j=await r.json();}catch(e){}}return j;};
const camp=async()=>{const j=await J(API+'/v3/shopping-curation/sales-campaign/search/cursor');const c=j&&j.success&&(j.success.list||[]).find(x=>x.id===CID);return c||{id:CID,title:'기획전 '+CID};};
const applied=async()=>{const j=await J(API+'/v3/shopping-curation/sales-campaign/'+CID+'/items');const m={};((j&&j.success&&j.success.list)||[]).forEach(x=>{m[x.productItemId]=[x.status,x.desiredSalePrice||0,x.rejectReason||''];});return m;};
const products=async()=>{const all=[];let c=null;for(let p=0;p<30;p++){say('토스 상품 읽는 중… '+all.length+'개 옵션');const u=new URL(API+'/v2/shopping-internal/product-items/grouped-by-products');u.searchParams.set('size','100');if(c)u.searchParams.set('nextCursor',c);const j=await J(u);if(!j||!j.success)throw new Error('토스 상품 목록을 읽지 못했어요. 로그인돼 있는지 확인해 주세요.');
  (j.success.items||[]).forEach(p=>(p.productItems||[]).forEach(i=>{all.push({id:i.itemId,pid:p.productId,pn:String(p.productName||'').replace(/\s+/g,' ').trim(),on:String(i.itemName||'').trim(),price:Number(i.salePrice)||0,st:i.status&&i.status.code||'',hide:!!i.isHide});}));
  c=j.success.paging&&j.success.paging.nextCursor;if(!c)break;}return all;};
const priceInfo=async(list)=>{const out={};for(let i=0;i<list.length;i+=50){say('기획전 조건(배송비·추천가) 확인 중… '+Math.min(i+50,list.length)+'/'+list.length);const part=list.slice(i,i+50);const j=await J(API+'/v3/shopping-curation/sales-campaign/product-items/price-info/v2',{method:'POST',body:JSON.stringify({salesCampaignId:CID,items:part.map(x=>({productItemId:x[0],desiredSalePrice:x[1]}))})});
  ((j&&j.success&&j.success.items)||[]).forEach((r,k)=>{const id=part[k][0];if(r&&r.success&&r.item){const d=r.item.deliveryFee||{};out[id]={ok:1,fee:[d.type||'',Number(d.amount)||0,Number(d.minimumPurchasePrice)||0,Number(d.calculatedAmount)||0],fin:Number(r.item.campaignFinalPrice)||0,rec:Number(r.item.tossRecommendationPrice)||0};}else out[id]={ok:0,err:(r&&r.error&&(r.error.message||r.error.reason))||'신청 불가'};});}return out;};
const readAll=async()=>{const c=await camp();const ap=await applied();const ps=await products();const sell=ps.filter(x=>x.st==='SELLING'&&!x.hide);const pi=await priceInfo(sell.map(x=>[x.id,x.price]));
  const items=sell.map(x=>{const q=pi[x.id]||{};const a=ap[x.id]||null;return [x.id,x.pid,x.pn,x.on,x.price,q.fee||null,q.rec||0,a,q.ok?'':(q.err||'')];});
  return {at:new Date().toISOString(),cid:CID,title:c.title||'',start:c.startAtInclusive||'',end:c.endAtExclusive||'',applyEnd:c.applyEndAtExclusive||'',status:c.status||'',items};};
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}raw=raw.trim();
try{
if(/^BJTCSET1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(9));}catch(e){box.remove();alert('신청 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  if(Number(D.cid)!==CID){box.remove();alert('복사한 신청 내용은 다른 기획전(번호 '+D.cid+') 거예요.\n그 기획전 화면에서 눌러 주세요.');return;}
  const want=(D.items||[]).map(x=>[Number(x[0]),Math.round(Number(x[1])||0)]).filter(x=>x[0]&&x[1]>=100);
  if(!want.length){box.remove();alert('신청할 상품이 없어요.');return;}
  const ap=await applied();const ps=await products();const by={};ps.forEach(x=>{by[x.id]=x;});
  const list=want.filter(x=>by[x[0]]&&!(ap[x[0]]&&ap[x[0]][0]!=='REJECTED'&&ap[x[0]][1]===x[1]));
  const chk=await priceInfo(list);const bad=list.filter(x=>!chk[x[0]]||!chk[x[0]].ok),go=list.filter(x=>chk[x[0]]&&chk[x[0]].ok);
  if(!go.length){box.remove();alert('신청할 수 있는 상품이 없어요.'+(bad.length?'\n\n'+bad.slice(0,10).map(x=>'· '+(by[x[0]]?by[x[0]].pn:x[0])+' — '+(chk[x[0]]?chk[x[0]].err:'확인 실패')).join('\n'):''));return;}
  const f=n=>Number(n).toLocaleString('ko-KR');
  const nm=x=>'· '+by[x[0]].pn.slice(0,30)+(by[x[0]].on?' ['+by[x[0]].on+']':'')+'\n   '+f(by[x[0]].price)+'원 → '+f(x[1])+'원';
  let msg='토스 기획전에 신청할까요?\n「'+(D.title||('기획전 '+CID))+'」\n\n'+go.length+'개 옵션\n'+go.slice(0,12).map(nm).join('\n')+(go.length>12?'\n… 외 '+(go.length-12)+'개':'');
  if(bad.length)msg+='\n\n신청 불가로 빼는 것 '+bad.length+'개';
  const skip=want.length-list.length;if(skip)msg+='\n이미 같은 가격으로 신청돼 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  box.textContent='확인창을 확인해 주세요.';if(!confirm(msg)){box.remove();return;}
  let okN=0;const fails=[];
  for(let i=0;i<go.length;i+=50){say('기획전 신청 중… '+Math.min(i+50,go.length)+'/'+go.length);const part=go.slice(i,i+50);
    try{const r=await fetch(API+'/v3/shopping-curation/sales-campaign/'+CID+'/items/apply',{method:'POST',credentials:'include',headers:Object.assign({},H,{'Content-Type':'application/json'}),body:JSON.stringify({items:part.map(x=>({productItemId:x[0],desiredSalePrice:x[1]}))})});let j=null;try{j=await r.json();}catch(e){}
      const s=j&&j.success;if(!r.ok||!s){fails.push('요청 실패: '+((j&&j.error&&(j.error.reason||j.error.message))||('HTTP '+r.status)));continue;}
      okN+=(s.successItemIds||[]).length;(s.failedItems||[]).forEach(x=>fails.push((by[x.productItemId]?by[x.productItemId].pn.slice(0,30):x.productItemId)+' — '+(x.reason||'실패')));}
    catch(e){fails.push('요청 실패: '+(e&&e.message||e));}}
  say('결과 다시 읽는 중…');const P=await readAll();const payload='BJTCP1:'+JSON.stringify(P);let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent='기획전 신청: 성공 '+okN+'개'+(fails.length?' · 실패 '+fails.length+'개\n\n'+fails.slice(0,15).join('\n'):'')+(bad.length?'\n\n신청 불가로 뺀 것 '+bad.length+'개:\n'+bad.slice(0,8).map(x=>'· '+by[x[0]].pn.slice(0,30)+' — '+chk[x[0]].err).join('\n'):'')+'\n\n토스 심사 뒤 승인/반려가 결정돼요. 화면을 새로고침하면 신청 목록이 보여요.\n바뀐 기획전 상품 목록(BJTCP1)을 복사해요. 관리 사이트에 붙여넣으면 신청 상태가 최신으로 바뀌어요.';box.append(t);copyBtn(payload,copied);close();return;
}
const P=await readAll();
const payload='BJTCP1:'+JSON.stringify(P);
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');
const ap=P.items.filter(r=>r[7]).length,no=P.items.filter(r=>r[8]).length;
t.textContent='「'+P.title+'」\n판매중인 토스 옵션 '+P.items.length+'개를 읽었어요. (이미 신청 '+ap+' · 이 기획전 신청 불가 '+no+')\n\n관리 사이트 [상품 관리 → 토스 → 🎯 기획전 신청] 칸에 붙여넣으세요(Ctrl+V).';box.append(t);copyBtn(payload,copied);close();
}catch(e){box.innerHTML='';const t=document.createElement('div');t.textContent='오류: '+(e&&e.message||e);box.append(t);close();}
})();
