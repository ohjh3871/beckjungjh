(async()=>{
if(!/^shopping-seller\.kakao\.com$/.test(location.host)){alert('카카오 톡스토어 판매자센터(shopping-seller.kakao.com) 화면에서 눌러주세요.');return;}
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';document.body.append(box);
const say=t=>{box.textContent=t;};
const close=()=>{const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);};
const copyBtn=(payload,copied)=>{const bt=document.createElement('button');bt.style.cssText='display:block;margin-top:12px;background:#facc15;color:#111;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:15px';const ok=()=>{bt.textContent=ALL?'✔ 품절 한 번에 진행 내용 복사됨 — 다음 마켓에서 북마크를 누르세요':'✔ 톡스토어 상품 목록(BJKSP1) 복사됨 — 관리 사이트 [상품 관리 → 카카오] 칸에 붙여넣기만 하면 돼요';bt.style.background='#86efac';};
  let done=copied;const tryCopy=async()=>{if(done)return;try{await navigator.clipboard.writeText(payload);done=true;ok();}catch(e){}};
  if(copied)ok();else{bt.textContent='📋 톡스토어 상품 목록 복사 (이 화면을 누르면 자동 복사돼요)';const iv=setInterval(()=>{if(done){clearInterval(iv);return;}if(document.hasFocus())tryCopy();},700);window.addEventListener('focus',tryCopy);document.addEventListener('pointerdown',tryCopy,true);setTimeout(()=>clearInterval(iv),30*60000);}
  bt.onclick=async()=>{done=false;await tryCopy();};box.append(bt);};
const getAll=async()=>{const all=[];for(let p=0;p<30;p++){say('톡스토어 상품 목록 읽는 중… '+all.length+'개');const u=new URL('/api/tstore/products',location.origin);['WAIT','ON_SALE','OUT_OF_STOCK','SUSPENSION','CLOSE','PROHIBITION'].forEach(s=>u.searchParams.append('statuses',s));u.searchParams.set('periodType','REGISTRATION_DATE');u.searchParams.set('from','20000101000000');u.searchParams.set('to','20991231235959');u.searchParams.set('size','100');u.searchParams.set('page',p);let j=null;for(let k=0;k<3&&!j;k++){try{const r=await fetch(u,{credentials:'include',headers:{accept:'application/json'}});if(r.ok)j=await r.json();}catch(e){}}
  if(!j||!Array.isArray(j.contents))throw new Error('톡스토어 상품 목록을 읽지 못했어요. 판매자센터에 로그인돼 있는지 확인해 주세요.');
  j.contents.forEach(x=>{const s=String(x.displayedSaleStatus||'');all.push([String(x.id),String(x.name||'').replace(/\s+/g,' ').trim(),s==='판매중'?'S':s==='판매중지'?'H':'X',String(x.storeManagementCode||'').trim(),Number(x.stockQuantity)||0,s]);});
  if(j.last||!j.contents.length)break;}return all;};
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}raw=raw.trim();
const ALLMK='kakao',ALLNM={c24:'카페24',toss:'토스',esm:'ESM',kakao:'카카오 톡스토어'};let ALL=null;
if(/^BJALL1:/.test(raw)){try{ALL=JSON.parse(raw.slice(7));}catch(e){ALL=null;}if(ALL){const pt=ALL.m&&ALL.m[ALLMK];raw=pt?'BJKSET1:'+JSON.stringify(pt):'';}}
const wrapOut=p=>{if(!ALL)return p;const i=p.indexOf(':');ALL.fresh=ALL.fresh||{};try{ALL.fresh[ALLMK]=JSON.parse(p.slice(i+1));}catch(e){}ALL.done=ALL.done||{};ALL.done[ALLMK]=new Date().toISOString();return 'BJALL1:'+JSON.stringify(ALL);};
const allNote=()=>{if(!ALL)return;const left=(ALL.order||[]).filter(k=>!(ALL.done||{})[k]);const d=document.createElement('div');d.style.cssText='margin-top:10px;padding:8px 10px;background:#fef9c3;color:#111;border-radius:8px;white-space:pre-wrap';d.textContent='🧾 품절 한 번에 진행 중\n'+(left.length?'남은 곳: '+left.map(k=>ALLNM[k]).join(', ')+'\n그 화면에서 같은 방식으로 북마크를 누르세요(복사된 내용 그대로 이어져요).':'모든 마켓 끝! 관리 사이트 [상품 관리] 맨 위 ‘품절 한 번에’ 칸에 붙여넣으면 결과가 한꺼번에 최신으로 바뀌어요.');box.append(d);};
try{
if(/^BJKSET1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(8));}catch(e){box.remove();alert('반영 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const cur=await getAll();const by={};cur.forEach(r=>{by[r[0]]=r;});
  const off=(D.off||[]).map(String).filter(n=>by[n]&&by[n][2]==='S'),on=(D.on||[]).map(String).filter(n=>by[n]&&by[n][2]==='H');
  if(!off.length&&!on.length){box.remove();alert('바꿀 상품이 없어요. 이미 반영돼 있어요.');return;}
  const nm=n=>'· '+by[n][1];
  let msg='톡스토어 판매상태를 바꿀까요?\n';
  if(off.length)msg+='\n[판매중지] '+off.length+'개 (품절)\n'+off.slice(0,15).map(nm).join('\n')+(off.length>15?'\n… 외 '+(off.length-15)+'개':'')+'\n';
  if(on.length)msg+='\n[판매중지 해제] '+on.length+'개 (재입고)\n'+on.slice(0,15).map(nm).join('\n')+(on.length>15?'\n… 외 '+(on.length-15)+'개':'')+'\n';
  const skip=(D.off||[]).length+(D.on||[]).length-off.length-on.length;if(skip)msg+='\n이미 바뀌어 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  box.textContent='확인창을 확인해 주세요.';if(!confirm(msg)){box.remove();return;}
  const put=async(ids,path)=>{try{const r=await fetch('/api/tstore/products/multiple/'+path,{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json',accept:'application/json'},body:JSON.stringify({productIds:ids})});let j=null;try{j=await r.json();}catch(e){}return r.ok?null:((j&&(j.message||j.errorMessage||j.error))||('HTTP '+r.status));}catch(e){return String(e&&e.message||e);}};
  const res=[];
  for(let i=0;i<off.length;i+=50){say('판매중지로 바꾸는 중… '+Math.min(i+50,off.length)+'/'+off.length);const e=await put(off.slice(i,i+50),'suspension');if(e)res.push('판매중지 실패: '+e);}
  for(let i=0;i<on.length;i+=50){say('판매중지 해제 중… '+Math.min(i+50,on.length)+'/'+on.length);const e=await put(on.slice(i,i+50),'suspension/release');if(e)res.push('판매중지 해제 실패: '+e);}
  const after=await getAll();const ab={};after.forEach(r=>{ab[r[0]]=r;});
  const notYet=[...off.filter(n=>ab[n]&&ab[n][2]==='S'),...on.filter(n=>ab[n]&&ab[n][2]==='H')].map(n=>ab[n][1]);
  const payload=wrapOut('BJKSP1:'+JSON.stringify({at:new Date().toISOString(),items:after}));let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent='판매중지 '+off.length+'개 · 판매중지 해제 '+on.length+'개 요청했어요.'+(res.length?'\n\n'+res.join('\n'):'')+(notYet.length?'\n\n다시 읽었을 때 아직 안 바뀐 것 '+notYet.length+'개:\n'+notYet.slice(0,10).join('\n'):(res.length?'':'\n다시 읽어보니 전부 바뀌었어요.'))+'\n\n바뀐 톡스토어 상품 목록 전체(BJKSP1)를 복사해요. 관리 사이트 [상품 관리 → 카카오] 칸에 붙여넣으세요.';box.append(t);allNote();copyBtn(payload,copied);close();return;
}
const items=await getAll();
const payload=wrapOut('BJKSP1:'+JSON.stringify({at:new Date().toISOString(),items}));
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');
t.textContent='톡스토어 상품 '+items.length+'개를 읽었어요. (판매중 '+items.filter(r=>r[2]==='S').length+' · 판매중지 '+items.filter(r=>r[2]==='H').length+' · 기타 '+items.filter(r=>r[2]==='X').length+')\n\n관리 사이트 [상품 관리 → 카카오] 칸에 붙여넣으세요(Ctrl+V).';box.append(t);allNote();copyBtn(payload,copied);close();
}catch(e){box.innerHTML='';const t=document.createElement('div');t.textContent='오류: '+(e&&e.message||e);box.append(t);close();}
})();
