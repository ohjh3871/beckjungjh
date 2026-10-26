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
const getDone=async(days,unSet)=>{const out=[],ids=[];const lim=Date.now()-days*864e5;for(let p=1;p<=40;p++){say('답글 단 후기 읽는 중… '+ids.length+'개');const u=new URL(GW+'/business-review/api/v2/local_profiles/'+lp+'/reviews');u.searchParams.set('order','CREATED_AT_DESC');u.searchParams.set('page',p);u.searchParams.set('size','50');let j=null;for(let k=0;k<3&&!j;k++){try{const r=await fetch(u,{credentials:'include'});if(r.ok)j=await r.json();}catch(e){}}if(!j||!Array.isArray(j.data))break;let stop=false;j.data.forEach(r=>{if(Date.parse(r.created_at)<lim){stop=true;return;}if(!r.deleted&&!unSet.has(r.id))ids.push(r);});if(stop||!(j.meta&&p<j.meta.total_pages))break;}
  let n=0;const q=ids.slice();await Promise.all(Array.from({length:4},async()=>{while(q.length){const r=q.shift();try{const j=await (await fetch(GW+'/business-review/api/v2/reviews/'+r.id,{credentials:'include'})).json();const d=j&&j.data;if(d&&d.comment){const a=d.author||{},st=a.statistics||{},x=d.extend||{};out.push([d.id,d.star_rating_v2??d.star_rating??null,d.created_at,String(d.content||''),String(x.product_name||''),String(x.option_name||''),String(a.nickname||''),st.total_review_count||0,st.average_star_rating||0,(d.images||[]).length,d.comment.id,String(d.comment.content||''),d.comment.updated_at||d.comment.created_at||'']);}}catch(e){}n++;if(n%10===0)say('답글 단 후기 읽는 중… '+n+'/'+ids.length);}}));
  out.sort((x,y)=>String(y[2]).localeCompare(String(x[2])));return out;};
const DAYS=60;
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}raw=raw.trim();
try{
if(/^BJREVSET1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(10));}catch(e){box.remove();alert('답글 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const cur=await getAll();const by={};cur.forEach(r=>{by[r[0]]=r;});
  const doneL=await getDone(DAYS,new Set(cur.map(r=>r[0])));const dby={};doneL.forEach(r=>{dby[r[0]]=r;});
  const list=(D.items||[]).filter(x=>x&&x[2]!=='edit'&&by[x[0]]&&String(x[1]||'').trim());
  const edits=(D.items||[]).filter(x=>x&&x[2]==='edit'&&dby[x[0]]&&String(x[1]||'').trim()&&String(x[1]).trim()!==String(dby[x[0]][11]).trim());
  const skip=(D.items||[]).length-list.length-edits.length;
  if(!list.length&&!edits.length){box.remove();alert('올리거나 고칠 답글이 없어요. 이미 반영돼 있어요.');return;}
  let msg='당근 후기 답글을 '+(list.length?'새로 '+list.length+'개 올리고':'')+(list.length&&edits.length?', ':'')+(edits.length?'기존 답글 '+edits.length+'개를 고칠':'')+'까요?\n(당근에 바로 공개돼요)\n';
  edits.slice(0,5).forEach(x=>{const r=dby[x[0]];msg+='\n· [수정] '+r[6]+' +r[3].replace(/\s+/g,).slice(0,25)+\n   → '+String(x[1]).replace(/\s+/g,' ').slice(0,50)+'…';});
  list.slice(0,8).forEach(x=>{const r=by[x[0]];msg+='\n· '+r[6]+' ('+(r[1]??'-')+'점) "'+r[3].replace(/\s+/g,' ').slice(0,30)+'"\n   → '+String(x[1]).replace(/\s+/g,' ').slice(0,50)+'…';});
  if(list.length>8)msg+='\n… 외 '+(list.length-8)+'개';
  if(skip)msg+='\n\n이미 답글이 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  box.textContent='확인창을 확인해 주세요.';if(!confirm(msg)){box.remove();return;}
  if(!/\/manager\/reviews/.test(location.pathname)){box.remove();alert('당근 비즈프로필 [후기] 화면에서 눌러주세요.');return;}
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));const nz=t=>String(t||'').replace(/\s+/g,'');
  const cards=()=>[...document.querySelectorAll('button')].filter(x=>(x.textContent||'').trim()==='답글쓰기').map(btn=>{let c=btn;for(let i=0;i<8&&c;i++){c=c.parentElement;if(c&&(c.innerText||'').length>20&&c.querySelectorAll('button').length>=2)break;}return {btn,card:c,txt:c?c.innerText:''};});
  const firstTxt=()=>{const c=cards()[0];return c?c.txt.slice(0,60):'';};
  const pgBtn=n=>[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')===n+'페이지');
  const curPage=()=>{const x=[...document.querySelectorAll('button[aria-current="page"]')].find(y=>/페이지/.test(y.getAttribute('aria-label')||''));return x?Number(x.textContent.trim()):1;};
  const waitChange=async before=>{for(let i=0;i<40;i++){await sleep(150);if(firstTxt()!==before)return true;}return false;};
  const goPage=async n=>{for(let g=0;g<80&&curPage()!==n;g++){const before=firstTxt();let bt=pgBtn(n);if(!bt){const nx=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')===(curPage()<n?'다음 페이지':'이전 페이지'));if(!nx||nx.disabled)return false;bt=nx;}bt.click();await waitChange(before);await sleep(300);}return curPage()===n;};
  const idxOf=async id=>{const L=await getAll();const i=L.findIndex(r=>r[0]===id);return i;};
  const isFilt=()=>/EXCLUDE_COMMENTED_REVIEW/.test(location.search);
  const setMode=async f=>{if(isFilt()===f)return true;const t=[...document.querySelectorAll('button,label,div,span,input')].filter(x=>(x.textContent||'').trim()==='답글 없는 후기만').pop();if(!t)return false;const before=firstTxt();t.click();for(let i=0;i<40&&isFilt()!==f;i++)await sleep(150);await waitChange(before);await sleep(400);return isFilt()===f;};
  const idxAll=async id=>{for(let p=1;p<=40;p++){const u=new URL(GW+'/business-review/api/v2/local_profiles/'+lp+'/reviews');u.searchParams.set('order','CREATED_AT_DESC');u.searchParams.set('page',p);u.searchParams.set('size','50');const j=await (await fetch(u,{credentials:'include'})).json();const i=(j.data||[]).findIndex(r=>r.id===id);if(i>=0)return (p-1)*50+i;if(!(j.meta&&p<j.meta.total_pages))break;}return -1;};
  const cardsDone=()=>[...document.querySelectorAll('button')].filter(x=>(x.textContent||'').trim()==='도움돼요').map(btn=>{let c=btn;for(let i=0;i<8&&c;i++){c=c.parentElement;if(c&&(c.innerText||'').length>20&&c.querySelectorAll('button').length>=2)break;}return {card:c,txt:c?c.innerText:''};}).filter(c=>/사장님의 답글/.test(c.txt));
  const commentOf=async id=>{try{const j=await (await fetch(GW+'/business-review/api/v2/reviews/'+id,{credentials:'include'})).json();return j&&j.data&&j.data.comment?String(j.data.comment.content||''):null;}catch(e){return null;}};
  const matchCard=r=>{const nick=r[6],ct=nz(r[3]).slice(0,25);return cards().find(c=>c.txt.split('\n')[0].trim()===nick&&(!ct||nz(c.txt).includes(ct)));};
  const setVal=(ta,v)=>{const d=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');d.set.call(ta,v);ta.dispatchEvent(new Event('input',{bubbles:true}));ta.dispatchEvent(new Event('change',{bubbles:true}));};
  const hasComment=async id=>{try{const j=await (await fetch(GW+'/business-review/api/v2/reviews/'+id,{credentials:'include'})).json();return !!(j&&j.data&&j.data.comment);}catch(e){return false;}};
  const ok=[],bad=[];
  if(list.length&&!(await setMode(true))){box.remove();alert('[답글 없는 후기만]을 켜지 못했어요. 그 버튼을 직접 켜고 다시 눌러주세요.');return;}
  for(let i=0;i<list.length;i++){const [id,txt]=list[i];const r=by[id];say('답글 올리는 중… '+(i+1)+'/'+list.length+'\n'+r[6]+' 님 후기 찾는 중');
    try{
      const ix=await idxOf(id);if(ix<0){bad.push(id+' (이미 답글이 있거나 목록에 없음)');continue;}
      const page=Math.floor(ix/5)+1;if(!(await goPage(page))){bad.push(id+' ('+page+'페이지로 못 감)');if(!ok.length)break;continue;}
      await sleep(400);let c=matchCard(r);
      if(!c){for(const p of [page-1,page+1]){if(p<1)continue;await goPage(p);await sleep(300);c=matchCard(r);if(c)break;}}
      if(!c){bad.push(id+' (화면에서 후기를 못 찾음)');if(!ok.length)break;continue;}
      c.card.scrollIntoView({block:'center'});c.btn.click();let ta=null;for(let k=0;k<30&&!ta;k++){await sleep(100);ta=c.card.querySelector('textarea')||[...document.querySelectorAll('textarea')].find(t=>(t.getAttribute('placeholder')||'').includes('답글'));}
      if(!ta){bad.push(id+' (답글 입력칸이 안 열림)');if(!ok.length)break;continue;}
      setVal(ta,String(txt));await sleep(300);
      let scope=ta;let sb=null;for(let k=0;k<6&&scope&&!sb;k++){scope=scope.parentElement;sb=scope?[...scope.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='등록'):null;}
      if(!sb||sb.disabled){const cb=scope&&[...scope.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='취소');if(cb)cb.click();bad.push(id+' (등록 버튼을 못 찾음)');if(!ok.length)break;continue;}
      sb.click();let done=false;for(let k=0;k<30&&!done;k++){await sleep(300);if(k%3===2)done=await hasComment(id);}
      if(!done)done=await hasComment(id);
      if(done)ok.push(id);else{bad.push(id+' (등록 후 확인 안 됨)');if(!ok.length)break;}
      await sleep(600);
    }catch(e){bad.push(id+' ('+e.message+')');if(!ok.length)break;}
  }
  const eok=[];
  if(edits.length){
    if(!(await setMode(false))){bad.push('수정: [답글 없는 후기만]을 끄지 못했어요. 끄고 다시 눌러주세요');}
    else for(let i=0;i<edits.length;i++){const [id,txt]=edits[i];const r=dby[id];say('답글 고치는 중… '+(i+1)+'/'+edits.length+'\n'+r[6]+' 님 후기');
      try{
        const ix=await idxAll(id);if(ix<0){bad.push(id+' 수정 (목록에 없음)');continue;}
        const page=Math.floor(ix/5)+1;if(!(await goPage(page))){bad.push(id+' 수정 ('+page+'페이지로 못 감)');continue;}
        await sleep(400);const ct=nz(r[3]).slice(0,25);const fc=()=>cardsDone().find(c=>c.txt.split('\n')[0].trim()===r[6]&&(!ct||nz(c.txt).includes(ct)));
        let c=fc();if(!c){for(const p of [page-1,page+1]){if(p<1)continue;await goPage(p);await sleep(300);c=fc();if(c)break;}}
        if(!c){bad.push(id+' 수정 (화면에서 후기를 못 찾음)');continue;}
        c.card.scrollIntoView({block:'center'});const mb=[...c.card.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='더보기');if(!mb){bad.push(id+' 수정 (더보기 버튼 없음)');continue;}
        mb.click();let eb=null;for(let k=0;k<20&&!eb;k++){await sleep(100);eb=[...document.querySelectorAll('button,[role=menuitem]')].find(x=>(x.textContent||'').trim()==='수정');}
        if(!eb){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));bad.push(id+' 수정 (수정 메뉴 없음)');continue;}
        eb.click();let ta=null;for(let k=0;k<30&&!ta;k++){await sleep(100);ta=c.card.querySelector('textarea')||document.querySelector('textarea');}
        if(!ta){bad.push(id+' 수정 (입력칸이 안 열림)');continue;}
        setVal(ta,String(txt));await sleep(300);let scope=ta,sb=null;for(let k=0;k<6&&scope&&!sb;k++){scope=scope.parentElement;sb=scope?[...scope.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='등록'):null;}
        if(!sb||sb.disabled){const cb=scope&&[...scope.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='취소');if(cb)cb.click();bad.push(id+' 수정 (등록 버튼 없음)');continue;}
        sb.click();let done=false;for(let k=0;k<20&&!done;k++){await sleep(400);const cm=await commentOf(id);done=cm!=null&&nz(cm)===nz(txt);}
        if(done)eok.push(id);else bad.push(id+' 수정 (저장 확인 안 됨)');await sleep(500);
      }catch(e){bad.push(id+' 수정 ('+e.message+')');}
    }
  }
  const after=await getAll();const doneA=await getDone(DAYS,new Set(after.map(r=>r[0])));const payload='BJREV1:'+JSON.stringify({at:new Date().toISOString(),lp,items:after,done:doneA,posted:ok,edited:eok});let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent='답글 올림: 성공 '+ok.length+'개'+(edits.length?' · 수정 성공 '+eok.length+'개':'')+(bad.length?' · 실패 '+bad.length+'개\n'+bad.slice(0,5).join('\n')+(ok.length===0?'\n(첫 답글이 실패해서 나머지는 멈췄어요. 위 이유를 Claude에게 알려주세요)':''):'')+'\n\n바뀐 후기 목록(BJREV1)을 복사해요. 관리 사이트 [당근 후기] 칸에 붙여넣으세요.';box.append(t);copyBtn(payload,copied);close();return;
}
const items=await getAll();
const done=await getDone(DAYS,new Set(items.map(r=>r[0])));
const payload='BJREV1:'+JSON.stringify({at:new Date().toISOString(),lp,items,done});
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');t.textContent='답글 없는 당근 후기 '+items.length+'개, 최근 '+DAYS+'일 답글 단 후기 '+done.length+'개를 읽었어요.\n\n관리 사이트 [당근 후기] 칸에 붙여넣으세요(Ctrl+V).';box.append(t);copyBtn(payload,copied);close();
}catch(e){box.innerHTML='';const t=document.createElement('div');t.textContent='오류: '+(e&&e.message||e);box.append(t);close();}
})();
