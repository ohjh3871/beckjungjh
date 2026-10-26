(async()=>{
if(!/shopping-seller\.toss\.im$/.test(location.host)){alert('토스쇼핑 파트너스(shopping-seller.toss.im) 화면에서 눌러주세요.');return;}
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';document.body.append(box);
const say=t=>{box.textContent=t;};
const close=()=>{const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);};
const copyBtn=(payload,copied)=>{const bt=document.createElement('button');bt.style.cssText='display:block;margin-top:12px;background:#facc15;color:#111;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:15px';const ok=()=>{bt.textContent='✔ 토스 상품 목록(BJTSP1) 복사됨 — 관리 사이트 [상품 관리 → 토스] 칸에 붙여넣기만 하면 돼요';bt.style.background='#86efac';};
  let done=copied;const tryCopy=async()=>{if(done)return;try{await navigator.clipboard.writeText(payload);done=true;ok();}catch(e){}};
  if(copied)ok();else{bt.textContent='📋 토스 상품 목록 복사 (이 화면을 누르면 자동 복사돼요)';const iv=setInterval(()=>{if(done){clearInterval(iv);return;}if(document.hasFocus())tryCopy();},700);window.addEventListener('focus',tryCopy);document.addEventListener('pointerdown',tryCopy,true);setTimeout(()=>clearInterval(iv),30*60000);}
  bt.onclick=async()=>{done=false;await tryCopy();};box.append(bt);};
const H={'x-merchant-id':'46627','x-merchant-user-id':'80697','x-toss-frontend-service':'shopping-seller-toss-im'};
const API='https://api-public.toss.im/api-public';
const getAll=async()=>{const all=[];let c=null;for(let p=0;p<30;p++){say('토스 상품 목록 읽는 중… '+all.length+'개');const u=new URL(API+'/v2/shopping-internal/product-items/grouped-by-products');u.searchParams.set('size','100');if(c)u.searchParams.set('nextCursor',c);let j=null;for(let k=0;k<3&&!j;k++){try{const r=await fetch(u,{credentials:'include',headers:H});if(r.ok)j=await r.json();}catch(e){}}
  if(!j||!j.success)throw new Error('토스 상품 목록을 읽지 못했어요. 토스쇼핑 파트너스에 로그인돼 있는지 확인해 주세요.');
  (j.success.items||[]).forEach(p=>{const its=p.productItems||[];const live=its.filter(i=>i.status&&i.status.code==='SELLING'&&!i.isHide);const hid=its.filter(i=>i.isHide||(i.status&&i.status.code==='WAITING_FOR_SALE'));const so=its.filter(i=>i.status&&i.status.code==='SOLD_OUT');
    const st=live.length?'S':(hid.length&&hid.length+so.length===its.length?'H':(so.length===its.length&&its.length?'O':'X'));
    all.push([p.productId,String(p.productName||'').replace(/\s+/g,' ').trim(),st,its.map(i=>i.itemId),its.reduce((t,i)=>t+(Number(i.quantity)||0),0),its.length?Math.min(...its.map(i=>Number(i.salePrice)||0)):0]);});
  c=j.success.paging&&j.success.paging.nextCursor;if(!c)break;}return all;};
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}raw=raw.trim();
try{
if(/^BJTSET1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(8));}catch(e){box.remove();alert('반영 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const cur=await getAll();const by={};cur.forEach(r=>{by[r[0]]=r;});
  const hide=(D.hide||[]).map(Number).filter(n=>by[n]&&by[n][2]==='S'),show=(D.show||[]).map(Number).filter(n=>by[n]&&by[n][2]==='H');
  if(!hide.length&&!show.length){box.remove();alert('바꿀 상품이 없어요. 이미 반영돼 있어요.');return;}
  const nm=n=>'· '+by[n][1];
  let msg='토스 판매상태를 바꿀까요?\n';
  if(hide.length)msg+='\n[판매 대기로] '+hide.length+'개 (품절이라 숨김)\n'+hide.slice(0,15).map(nm).join('\n')+(hide.length>15?'\n… 외 '+(hide.length-15)+'개':'')+'\n';
  if(show.length)msg+='\n[판매중으로] '+show.length+'개 (재입고)\n'+show.slice(0,15).map(nm).join('\n')+(show.length>15?'\n… 외 '+(show.length-15)+'개':'')+'\n';
  const skip=(D.hide||[]).length+(D.show||[]).length-hide.length-show.length;if(skip)msg+='\n이미 바뀌어 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  box.textContent='확인창을 확인해 주세요.';if(!confirm(msg)){box.remove();return;}
  const put=async(nos,h)=>{const ids=[].concat(...nos.map(n=>by[n][3]));const r=await fetch(API+'/v1/shopping-internal/product-items/update-hide-status',{method:'PUT',credentials:'include',headers:{...H,'Content-Type':'application/json'},body:JSON.stringify({productIds:[],productItemIds:ids,hide:h})});let j=null;try{j=await r.json();}catch(e){}const s=j&&j.success||{};const f=(s.failedItemIds||[]).length+(s.failedProductIds||[]).length;return {ok:r.ok&&j&&j.resultType!=='FAIL'&&!f,f,msg:j&&j.error&&j.error.reason};};
  const res=[];
  if(hide.length){say('판매 대기로 바꾸는 중… '+hide.length+'개');const r=await put(hide,true);res.push('판매 대기 '+hide.length+'개: '+(r.ok?'완료':'실패'+(r.f?' '+r.f+'건':'')+(r.msg?' ('+r.msg+')':'')));}
  if(show.length){say('판매중으로 바꾸는 중… '+show.length+'개');const r=await put(show,false);res.push('판매중 '+show.length+'개: '+(r.ok?'완료':'실패'+(r.f?' '+r.f+'건':'')+(r.msg?' ('+r.msg+')':'')));}
  const after=await getAll();const payload='BJTSP1:'+JSON.stringify({at:new Date().toISOString(),items:after});let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent=res.join('\n')+'\n\n바뀐 토스 상품 목록 전체(BJTSP1)를 복사해요. 관리 사이트 [상품 관리 → 토스] 칸에 붙여넣으세요.\n토스 화면은 새로고침하면 바뀐 상태로 보여요.';box.append(t);copyBtn(payload,copied);close();return;
}
const items=await getAll();
const payload='BJTSP1:'+JSON.stringify({at:new Date().toISOString(),items});
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');
t.textContent='토스 상품 '+items.length+'개를 읽었어요. (판매중 '+items.filter(r=>r[2]==='S').length+' · 판매 대기 '+items.filter(r=>r[2]==='H').length+' · 품절 '+items.filter(r=>r[2]==='O').length+')\n\n관리 사이트 [상품 관리 → 토스] 칸에 붙여넣으세요(Ctrl+V).';box.append(t);copyBtn(payload,copied);close();
}catch(e){box.innerHTML='';const t=document.createElement('div');t.textContent='오류: '+(e&&e.message||e);box.append(t);close();}
})();
