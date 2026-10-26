(async()=>{
if(!/bizprofile\.daangn\.com$/.test(location.host)){alert('당근 비즈프로필 [후기] 화면(bizprofile.daangn.com)에서 눌러주세요.');return;}
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';document.body.append(box);
const say=t=>{box.textContent=t;};
const close=()=>{const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);};
const copyBtn=(payload,copied)=>{const bt=document.createElement('button');bt.style.cssText='display:block;margin-top:12px;background:#facc15;color:#111;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:15px';const ok=()=>{bt.textContent='✔ 후기 목록(BJREV1) 복사됨 — 관리 사이트 [당근 후기] 칸에 붙여넣기만 하면 돼요';bt.style.background='#86efac';};
  let done=copied;const tryCopy=async()=>{if(done)return;try{await navigator.clipboard.writeText(payload);done=true;ok();}catch(e){}};
  if(copied)ok();else{bt.textContent='📋 후기 목록 복사 (이 화면을 누르면 자동 복사돼요)';const iv=setInterval(()=>{if(done){clearInterval(iv);return;}if(document.hasFocus())tryCopy();},700);window.addEventListener('focus',tryCopy);document.addEventListener('pointerdown',tryCopy,true);setTimeout(()=>clearInterval(iv),30*60000);}
  bt.onclick=async()=>{done=false;await tryCopy();};box.append(bt);};
const bizId=(location.pathname.match(/biz_accounts\/(\d+)/)||[])[1]||'1474737';
const GW='https://business-gateway.daangn.com';
const getLP=async()=>{try{const j=await (await fetch(GW+'/business-account/api/v2/business_accounts/'+bizId+'?includeRole=true&includeExtra=true',{credentials:'include'})).json();const s=JSON.stringify(j);const m=s.match(/"local_?[pP]rofile_?[iI]d"\s*:\s*(\d+)/)||s.match(/"localProfile"\s*:\s*\{"id"\s*:\s*(\d+)/);if(m)return m[1];}catch(e){}return '1472266';};
const lp=await getLP();
const getAll=async()=>{const all=[];for(let p=1;p<=60;p++){say('답글 없는 후기 읽는 중… '+all.length+'개');const u=new URL(GW+'/business-review/api/v2/local_profiles/'+lp+'/reviews');u.searchParams.set('order','CREATED_AT_DESC');u.searchParams.set('page',p);u.searchParams.set('size','50');u.searchParams.set('filter','EXCLUDE_COMMENTED_REVIEW');let j=null;for(let k=0;k<3&&!j;k++){try{const r=await fetch(u,{credentials:'include'});if(r.ok)j=await r.json();}catch(e){}}
  if(!j||!Array.isArray(j.data))throw new Error('후기를 읽지 못했어요. 당근 비즈프로필에 로그인돼 있는지 확인해 주세요.');
  j.data.filter(r=>!r.deleted).forEach(r=>{const a=r.author||{},st=a.statistics||{},x=r.extend||{};all.push([r.id,r.star_rating_v2??r.star_rating??null,r.created_at,String(r.content||''),String(x.product_name||''),String(x.option_name||''),String(a.nickname||''),st.total_review_count||0,st.average_star_rating||0,(r.images||[]).length]);});
  const meta=j.meta||{};if(!meta.total_pages||p>=meta.total_pages)break;}return all;};
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}raw=raw.trim();
try{
if(/^BJREVSET1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(10));}catch(e){box.remove();alert('답글 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const cur=await getAll();const by={};cur.forEach(r=>{by[r[0]]=r;});
  const list=(D.items||[]).filter(x=>x&&by[x[0]]&&String(x[1]||'').trim());
  const skip=(D.items||[]).length-list.length;
  if(!list.length){box.remove();alert('올릴 답글이 없어요. 이미 답글이 달린 후기예요.');return;}
  let msg='당근 후기 '+list.length+'개에 답글을 올릴까요?\n(올린 답글은 당근에 바로 공개돼요)\n';
  list.slice(0,8).forEach(x=>{const r=by[x[0]];msg+='\n· '+r[6]+' ('+(r[1]??'-')+'점) "'+r[3].replace(/\s+/g,' ').slice(0,30)+'"\n   → '+String(x[1]).replace(/\s+/g,' ').slice(0,50)+'…';});
  if(list.length>8)msg+='\n… 외 '+(list.length-8)+'개';
  if(skip)msg+='\n\n이미 답글이 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  box.textContent='확인창을 확인해 주세요.';if(!confirm(msg)){box.remove();return;}
  const ok=[],bad=[];
  for(let i=0;i<list.length;i++){const [id,txt]=list[i];say('답글 올리는 중… '+(i+1)+'/'+list.length);
    try{const r=await fetch(GW+'/business-review/api/legacy/reviews/'+id+'/comments',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:String(txt)})});if(r.ok)ok.push(id);else{let t='';try{t=(await r.text()).slice(0,120);}catch(e){}bad.push(id+' ('+r.status+' '+t.replace(/\s+/g,' ')+')');}}catch(e){bad.push(id+' ('+e.message+')');}
    await new Promise(r=>setTimeout(r,400));
    if(i===0&&bad.length)break;}
  const after=await getAll();const payload='BJREV1:'+JSON.stringify({at:new Date().toISOString(),lp,items:after,posted:ok});let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent='답글 올림: 성공 '+ok.length+'개'+(bad.length?' · 실패 '+bad.length+'개\n'+bad.slice(0,5).join('\n')+(ok.length===0?'\n(첫 답글이 실패해서 나머지는 멈췄어요)':''):'')+'\n\n바뀐 후기 목록(BJREV1)을 복사해요. 관리 사이트 [당근 후기] 칸에 붙여넣으세요.';box.append(t);copyBtn(payload,copied);close();return;
}
const items=await getAll();
const payload='BJREV1:'+JSON.stringify({at:new Date().toISOString(),lp,items});
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');t.textContent='답글 없는 당근 후기 '+items.length+'개를 읽었어요.\n\n관리 사이트 [당근 후기] 칸에 붙여넣으세요(Ctrl+V).';box.append(t);copyBtn(payload,copied);close();
}catch(e){box.innerHTML='';const t=document.createElement('div');t.textContent='오류: '+(e&&e.message||e);box.append(t);close();}
})();
