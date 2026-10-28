(async()=>{
if(!/(^|\.)item\.esmplus\.com$/.test(location.host)){if(/esmplus\.com$/.test(location.host)){if(confirm('ESM 상품 목록 화면(item.esmplus.com)에서 눌러야 해요.\n지금 그 화면으로 이동할까요? 이동한 뒤 북마크를 한 번 더 눌러 주세요.'))location.href='https://item.esmplus.com/goods/list';}else alert('ESM PLUS 상품 조회/수정 화면에서 눌러주세요.');return;}
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';document.body.append(box);
const say=t=>{box.textContent=t;};
const close=()=>{const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);};
const copyBtn=(payload,copied)=>{const bt=document.createElement('button');bt.style.cssText='display:block;margin-top:12px;background:#facc15;color:#111;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:15px';const ok=()=>{bt.textContent=ALL?'✔ 품절 한 번에 진행 내용 복사됨 — 다음 마켓에서 북마크를 누르세요':'✔ ESM 상품 목록(BJESP1) 복사됨 — 관리 사이트 [상품 관리 → ESM] 칸에 붙여넣기만 하면 돼요';bt.style.background='#86efac';};
  let done=copied;const tryCopy=async()=>{if(done)return;try{await navigator.clipboard.writeText(payload);done=true;ok();}catch(e){}};
  if(copied)ok();else{bt.textContent='📋 ESM 상품 목록 복사 (이 화면을 누르면 자동 복사돼요)';const iv=setInterval(()=>{if(done){clearInterval(iv);return;}if(document.hasFocus())tryCopy();},700);window.addEventListener('focus',tryCopy);document.addEventListener('pointerdown',tryCopy,true);setTimeout(()=>clearInterval(iv),30*60000);}
  bt.onclick=async()=>{done=false;await tryCopy();};box.append(bt);};
/* 사이트 상태 코드: 11 판매중, 21 판매중지, 그 외(22 등)는 건드리지 않음 */
const stOf=(g,a)=>{const s=[g,a].filter(x=>x!=null&&x!=='');if(!s.length)return 'X';if(s.some(x=>x!=='11'&&x!=='21'))return 'X';if(s.every(x=>x==='11'))return 'S';if(s.every(x=>x==='21'))return 'H';return 'M';};
const getAll=async()=>{const all=[];for(let p=1;p<=20;p++){say('ESM 상품 목록 읽는 중… '+all.length+'개');let j=null;for(let k=0;k<3&&!j;k++){try{const r=await fetch('/api/ea/goods/search',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:{goodsIds:'',keyword:'',sellStatus:[],category:{},registrationDate:{},shipping:{},additionalService:[]},pageIndex:p,pageSize:500,sortField:0,sortOrder:1})});if(r.ok)j=await r.json();}catch(e){}}
  if(!j||j.resultCode!==0||!j.data)throw new Error('ESM 상품 목록을 읽지 못했어요. ESM PLUS에 로그인돼 있는지 확인해 주세요.');
  const its=j.data.items||[];its.forEach(x=>{const ss=x.sellStatus||{},sid=x.siteSellerId||{},sk=x.stock||{};const g=ss.gmkt??null,a=ss.iac??null;
    all.push([Number(x.goodsNo),String(x.goodsName||'').replace(/\s+/g,' ').trim(),stOf(g,a),g,a,sid.gmkt||'',sid.iac||'',String(x.managedCode||'').trim(),[sk.gmkt??null,sk.iac??null]]);});
  if(all.length>=(j.data.totalCount||0)||!its.length)break;}return all;};
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}raw=raw.trim();
const ALLMK='esm',ALLNM={c24:'카페24',toss:'토스',esm:'ESM',kakao:'카카오 톡스토어'};let ALL=null;
if(/^BJALL1:/.test(raw)){try{ALL=JSON.parse(raw.slice(7));}catch(e){ALL=null;}if(ALL){const pt=ALL.m&&ALL.m[ALLMK];raw=pt?'BJESET1:'+JSON.stringify(pt):'';}}
const wrapOut=p=>{if(!ALL)return p;const i=p.indexOf(':');ALL.fresh=ALL.fresh||{};try{ALL.fresh[ALLMK]=JSON.parse(p.slice(i+1));}catch(e){}ALL.done=ALL.done||{};ALL.done[ALLMK]=new Date().toISOString();return 'BJALL1:'+JSON.stringify(ALL);};
const allNote=()=>{if(!ALL)return;const left=(ALL.order||[]).filter(k=>!(ALL.done||{})[k]);const d=document.createElement('div');d.style.cssText='margin-top:10px;padding:8px 10px;background:#fef9c3;color:#111;border-radius:8px;white-space:pre-wrap';d.textContent='🧾 품절 한 번에 진행 중\n'+(left.length?'남은 곳: '+left.map(k=>ALLNM[k]).join(', ')+'\n그 화면에서 같은 방식으로 북마크를 누르세요(복사된 내용 그대로 이어져요).':'모든 마켓 끝! 관리 사이트 [상품 관리] 맨 위 ‘품절 한 번에’ 칸에 붙여넣으면 결과가 한꺼번에 최신으로 바뀌어요.');box.append(d);};
try{
if(/^BJESET1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(8));}catch(e){box.remove();alert('반영 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const SITE=D.site==='g'||D.site==='a'?D.site:'all';const useG=SITE!=='a',useA=SITE!=='g';const SN=SITE==='g'?'G마켓만':SITE==='a'?'옥션만':'G마켓·옥션 같이';
  const cur0=await getAll();const cur=cur0.map(r=>{const x=r.slice();x[2]=stOf(useG?r[3]:null,useA?r[4]:null);return x;});const by={};cur.forEach(r=>{by[r[0]]=r;});
  /* 판매중지: 판매중인 사이트가 하나라도 있으면 → 있는 사이트 전부 중지. 판매가능: 중지된 사이트가 하나라도 있으면 → 있는 사이트 전부 판매 */
  const off=(D.off||[]).map(Number).filter(n=>by[n]&&(by[n][2]==='S'||by[n][2]==='M')),on=(D.on||[]).map(Number).filter(n=>by[n]&&(by[n][2]==='H'||by[n][2]==='M'));
  if(!off.length&&!on.length){box.remove();alert('바꿀 상품이 없어요. 이미 반영돼 있어요.');return;}
  const sites=r=>[useG&&r[3]!=null?'G마켓':'',useA&&r[4]!=null?'옥션':''].filter(Boolean).join('+');
  const nm=n=>'· '+by[n][1]+' ('+sites(by[n])+')';
  let msg='ESM 판매상태를 바꿀까요? (적용 대상: '+SN+')\n';
  if(off.length)msg+='\n[판매중지] '+off.length+'개 (품절)\n'+off.slice(0,15).map(nm).join('\n')+(off.length>15?'\n… 외 '+(off.length-15)+'개':'')+'\n';
  if(on.length)msg+='\n[판매가능] '+on.length+'개 (재입고)\n'+on.slice(0,15).map(nm).join('\n')+(on.length>15?'\n… 외 '+(on.length-15)+'개':'')+'\n';
  const skip=(D.off||[]).length+(D.on||[]).length-off.length-on.length;if(skip)msg+='\n이미 바뀌어 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  box.textContent='확인창을 확인해 주세요.';if(!confirm(msg)){box.remove();return;}
  const put=async(n,sell)=>{const r=by[n];const doG=useG&&r[3]!=null,doA=useA&&r[4]!=null;const isSell={};if(doG)isSell.gmkt=sell;if(doA)isSell.iac=sell;
    const h={'Content-Type':'application/json','X-G-SELLER-ID':doG?encodeURIComponent(r[5]):'','X-A-SELLER-ID':doA?encodeURIComponent(r[6]):''};
    try{const x=await fetch('/api/ea/goods/'+n+'/sellStatus',{method:'PUT',credentials:'include',headers:h,body:JSON.stringify({isSell})});let j=null;try{j=await x.json();}catch(e){}return x.ok&&(!j||j.resultCode===0||j.resultCode==null)?null:(j&&j.message||('HTTP '+x.status));}catch(e){return String(e&&e.message||e);}};
  const fails=[];let k=0;const jobs=[...off.map(n=>[n,false]),...on.map(n=>[n,true])];
  for(const [n,s] of jobs){k++;say((s?'판매가능':'판매중지')+'으로 바꾸는 중… '+k+'/'+jobs.length);const e=await put(n,s);if(e)fails.push(by[n][1]+' — '+e);}
  const after=await getAll();const ab={};after.forEach(r=>{const x=r.slice();x[2]=stOf(useG?r[3]:null,useA?r[4]:null);ab[r[0]]=x;});
  const notYet=[...off.filter(n=>ab[n]&&(ab[n][2]==='S'||ab[n][2]==='M')),...on.filter(n=>ab[n]&&(ab[n][2]==='H'||ab[n][2]==='M'))].map(n=>ab[n][1]);
  const payload=wrapOut('BJESP1:'+JSON.stringify({at:new Date().toISOString(),items:after}));let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent='['+SN+'] 판매중지 '+off.length+'개 · 판매가능 '+on.length+'개 요청했어요.'+(fails.length?'\n\n실패 '+fails.length+'개:\n'+fails.slice(0,10).join('\n'):'')+(notYet.length?'\n\n다시 읽었을 때 아직 안 바뀐 것 '+notYet.length+'개:\n'+notYet.slice(0,10).join('\n'):(fails.length?'':'\n다시 읽어보니 전부 바뀌었어요.'))+'\n\n바뀐 ESM 상품 목록 전체(BJESP1)를 복사해요. 관리 사이트 [상품 관리 → ESM] 칸에 붙여넣으세요.';box.append(t);allNote();copyBtn(payload,copied);close();return;
}
const items=await getAll();
const payload=wrapOut('BJESP1:'+JSON.stringify({at:new Date().toISOString(),items}));
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
const c=s=>items.filter(r=>r[2]===s).length;
box.innerHTML='';const t=document.createElement('div');
t.textContent='ESM 상품 '+items.length+'개를 읽었어요. (판매중 '+c('S')+' · 판매중지 '+c('H')+' · G마켓/옥션 엇갈림 '+c('M')+' · 기타 '+c('X')+')\n\n관리 사이트 [상품 관리 → ESM] 칸에 붙여넣으세요(Ctrl+V).';box.append(t);allNote();copyBtn(payload,copied);close();
}catch(e){box.innerHTML='';const t=document.createElement('div');t.textContent='오류: '+(e&&e.message||e);box.append(t);close();}
})();
