(async()=>{
if(!/cafe24\.com$/.test(location.host)||!/\/admin\//.test(location.pathname)){alert('카페24 관리자 화면(상품 목록)에서 눌러주세요.');return;}
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';document.body.append(box);
const say=t=>{box.textContent=t;};
const close=()=>{const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);};
const copyBtn=(payload,copied)=>{const bt=document.createElement('button');bt.style.cssText='display:block;margin-top:12px;background:#facc15;color:#111;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:15px';const ok=()=>{bt.textContent='✔ 카페24 목록(BJC24P1) 복사됨 — 관리 사이트 ② 칸에 붙여넣기만 하면 돼요';bt.style.background='#86efac';};
  let done=copied;const tryCopy=async()=>{if(done)return;try{await navigator.clipboard.writeText(payload);done=true;ok();}catch(e){}};
  if(copied)ok();else{bt.textContent='📋 카페24 목록 복사 (이 화면을 누르면 자동 복사돼요)';const iv=setInterval(()=>{if(done){clearInterval(iv);return;}if(document.hasFocus())tryCopy();},700);window.addEventListener('focus',tryCopy);document.addEventListener('visibilitychange',tryCopy);document.addEventListener('pointerdown',tryCopy,true);setTimeout(()=>clearInterval(iv),30*60000);}
  bt.onclick=async()=>{done=false;await tryCopy();if(!done){const ta=document.createElement('textarea');ta.value=payload;ta.style.cssText='width:100%;height:60px;margin-top:8px;color:#111';box.append(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){}}};box.append(bt);};
const shop=(location.pathname.match(/\/admin\/(shop\d+)\//)||[])[1]||'shop1';
const getAll=async()=>{const all=[];for(let p=1;p<=40;p++){say('카페24 상품 목록 읽는 중… '+p+'쪽 ('+all.length+'개)');const u=new URL('/disp/admin/'+shop+'/product/productmanage',location.origin);u.searchParams.set('page',p);u.searchParams.set('limit','100');let h='';for(let k=0;k<3&&!h;k++){try{const r=await fetch(u,{credentials:'include'});if(r.ok)h=await r.text();}catch(e){}}
  const d=new DOMParser().parseFromString(h,'text/html');const cbs=[...d.querySelectorAll('input.rowChk._product_no')];if(!cbs.length)break;
  const tbl=cbs[0].closest('table');const hs=tbl?[...tbl.querySelectorAll('thead th')].map(th=>th.textContent.replace(/\s+/g,'')):[];const iP=hs.findIndex(x=>x.indexOf('판매가')===0),iS=hs.findIndex(x=>x.indexOf('할인가')===0);const pn=t=>{const m=String(t||'').match(/\d[\d,]*/);return m?Number(m[0].replace(/,/g,''))||0:0;};
  cbs.forEach(c=>{const tr=c.closest('tr');const a=[...tr.querySelectorAll('a')].find(x=>/ProductRegister/.test(x.getAttribute('href')||'')&&x.textContent.trim()&&!/^P0[0-9A-Z]{6}$/.test(x.textContent.trim()));const td=tr.children;all.push([Number(c.value),c.getAttribute('is_selling')||'',c.getAttribute('is_display')||'',(a?a.textContent:'').trim().replace(/\s+/g,' '),iP>=0&&td[iP]?pn(td[iP].textContent):0,iS>=0&&td[iS]?pn(td[iS].textContent):0]);});
  if(cbs.length<100)break;}return all;};
window.focus();let raw='';try{raw=(await navigator.clipboard.readText())||'';}catch(e){}
raw=raw.trim();
if(/^BJPRC1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(7));}catch(e){box.remove();alert('가격 반영 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const cur=await getAll();const by={};cur.forEach(r=>{by[r[0]]=r;});
  const list=(D.items||[]).map(x=>[Number(x[0]),Number(x[1])||0,Number(x[2])||0]).filter(x=>x[0]&&x[1]>=100&&by[x[0]]&&by[x[0]][4]!==x[1]);
  if(!list.length){box.remove();alert('바꿀 판매가가 없어요. 이미 반영돼 있어요.');return;}
  const f=n=>Number(n).toLocaleString('ko-KR');
  const odd=list.filter(x=>x[2]&&by[x[0]][4]!==x[2]);
  let msg='카페24 판매가를 바꿀까요? '+list.length+'개\n(상품 수정 화면을 하나씩 열어 판매가만 바꾸고 [상품수정]을 눌러요)\n\n'+list.slice(0,15).map(x=>'· '+by[x[0]][3]+'\n   '+f(by[x[0]][4])+'원 → '+f(x[1])+'원').join('\n')+(list.length>15?'\n… 외 '+(list.length-15)+'개':'');
  if(odd.length)msg+='\n\n⚠ '+odd.length+'개는 사이트에서 본 가격과 지금 카페24 가격이 달라요(그사이 누가 바꿨을 수 있어요).';
  box.textContent='확인창을 확인해 주세요.';
  if(!confirm(msg)){box.remove();return;}
  const edit=(no,price)=>new Promise(res=>{
    const fr=document.createElement('iframe');fr.setAttribute('sandbox','allow-same-origin allow-scripts allow-forms');fr.style.cssText='position:fixed;left:-4000px;top:0;width:1280px;height:900px;border:0';
    fr.src='/disp/admin/'+shop+'/product/ProductRegister?product_no='+no;document.body.append(fr);
    const t0=Date.now();let stage=0;const msgs=[];let before='';
    const done=r=>{clearInterval(iv);setTimeout(()=>fr.remove(),500);res(Object.assign(r,{msgs,before}));};
    const iv=setInterval(()=>{if(stage!==0)return;let w,d;try{w=fr.contentWindow;d=w.document;}catch(e){}
      if(Date.now()-t0>120000)return done({ok:false,why:'수정 화면이 열리지 않았어요'});
      if(!w||!d||!w.MODIFY||!w.$||!d.getElementById('eProductModify'))return;
      const inp=d.querySelector('[name="product_price[1]"]');if(!inp)return done({ok:false,why:'판매가 칸을 못 찾았어요'});
      stage=1;setTimeout(()=>{try{
        w.alert=m=>{msgs.push(String(m));};w.confirm=m=>{msgs.push('? '+m);return false;};
        before=inp.value;w.$(inp).val(String(price)).trigger('keyup').trigger('change').trigger('blur');
        if(String(inp.value).replace(/\D/g,'')!==String(price))return done({ok:false,why:'판매가를 넣지 못했어요'});
        fr.addEventListener('load',()=>{stage=3;setTimeout(()=>done({ok:true}),1500);},{once:true});
        stage=2;w.$('#eProductModify').trigger('click');
        setTimeout(()=>{if(stage===2)done({ok:false,why:'저장이 진행되지 않았어요'+(msgs.length?': '+msgs.join(' / '):'')});},60000);
      }catch(e){done({ok:false,why:'오류: '+e.message});}},2500);
    },500);
  });
  const res=[];
  for(let i=0;i<list.length;i++){const no=list[i][0],price=list[i][1];say('판매가 바꾸는 중… '+(i+1)+'/'+list.length+'\n'+by[no][3]+'\n'+f(by[no][4])+'원 → '+f(price)+'원\n(상품 하나에 10~40초쯤 걸려요. 이 창을 닫지 마세요)');res.push([no,price,await edit(no,price)]);}
  say('결과 확인 중…');const after=await getAll();const ab={};after.forEach(r=>{ab[r[0]]=r;});
  const okN=res.filter(r=>ab[r[0]]&&ab[r[0]][4]===r[1]),bad=res.filter(r=>!(ab[r[0]]&&ab[r[0]][4]===r[1]));
  const payload='BJC24P1:'+JSON.stringify({at:new Date().toISOString(),items:after});let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');
  t.textContent='판매가 반영: 성공 '+okN.length+'개'+(bad.length?' · 실패 '+bad.length+'개':'')+'\n'+okN.slice(0,15).map(r=>'✔ '+by[r[0]][3]+' → '+f(r[1])+'원').join('\n')+(bad.length?'\n\n'+bad.map(r=>'✖ '+by[r[0]][3]+' — '+(r[2].why||('지금 판매가 '+f(ab[r[0]]?ab[r[0]][4]:0)+'원'+(r[2].msgs.length?' ('+r[2].msgs.join(' / ')+')':'')))).join('\n'):'')+'\n\n'+'바뀐 카페24 상품 목록 전체(BJC24P1)를 복사해요. 관리 사이트 [상품 관리] ② 칸에 붙여넣으면 바로 최신으로 바뀌어요.';
  box.append(t);copyBtn(payload,copied);close();return;
}
if(/^BJSELL1:/.test(raw)){
  let D;try{D=JSON.parse(raw.slice(8));}catch(e){box.remove();alert('반영 내용을 읽지 못했어요. 사이트에서 다시 복사해 주세요.');return;}
  const off=(D.off||[]).map(Number).filter(Boolean),on=(D.on||[]).map(Number).filter(Boolean),revRaw=(D.revive||[]).map(x=>Array.isArray(x)?[Number(x[0]),x[1]!==false]:[Number(x),true]).filter(x=>x[0]),rev=revRaw.map(x=>x[0]),revDisp=new Set(revRaw.filter(x=>x[1]).map(x=>x[0]));
  if(!off.length&&!on.length&&!rev.length){box.remove();alert('반영할 상품이 없어요.');return;}
  const cur=await getAll();const by={};cur.forEach(r=>{by[r[0]]=r;});
  const offN=off.filter(n=>by[n]&&by[n][1]==='T'),onN=on.filter(n=>by[n]&&by[n][1]==='F'),revS=rev.filter(n=>by[n]&&by[n][1]==='F'),revD=rev.filter(n=>revDisp.has(n)&&by[n]&&by[n][2]==='F');
  const nm=n=>'· '+(by[n]?by[n][3]:n);
  let msg='카페24 판매 상태를 바꿀까요?\n';
  if(offN.length)msg+='\n[판매안함] '+offN.length+'개\n'+offN.slice(0,15).map(nm).join('\n')+(offN.length>15?'\n… 외 '+(offN.length-15)+'개':'')+'\n';
  if(onN.length)msg+='\n[판매함] '+onN.length+'개\n'+onN.slice(0,15).map(nm).join('\n')+(onN.length>15?'\n… 외 '+(onN.length-15)+'개':'')+'\n';
  if(rev.length)msg+='\n[다시 판매] '+rev.length+'개\n'+rev.slice(0,15).map(n=>nm(n)+(revDisp.has(n)?'  (판매함+진열함)':'  (판매함만)')).join('\n')+(rev.length>15?'\n… 외 '+(rev.length-15)+'개':'')+'\n';
  const skip=off.length-offN.length+on.length-onN.length;if(skip)msg+='\n이미 바뀌어 있거나 목록에 없는 '+skip+'개는 건너뛰어요.';
  if(!offN.length&&!onN.length&&!revS.length&&!revD.length){box.remove();alert('바꿀 상품이 없어요. 이미 반영돼 있어요.');return;}
  box.textContent='확인창을 확인해 주세요.';
  if(!confirm(msg)){box.remove();return;}
  const url=(typeof getMultiShopUrl==='function')?getMultiShopUrl('/exec/admin/product/ProductManageState'):'/exec/admin/product/ProductManageState';
  const post=async(nos,state,change)=>{const b=new URLSearchParams();nos.forEach(n=>{b.append('product_no[]',n);b.append('market['+n+'][is_display]',by[n][2]);b.append('market['+n+'][is_selling]',by[n][1]);});b.append('change',change||'is_selling');b.append('state',state);const r=await fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','X-Requested-With':'XMLHttpRequest'},body:b});let j=null;try{j=await r.json();}catch(e){}return {ok:r.ok&&(!j||j.passed!==false),msg:j&&j.msg};};
  const res=[];
  if(offN.length){say('판매안함으로 바꾸는 중… '+offN.length+'개');const r=await post(offN,'F');res.push('판매안함 '+offN.length+'개: '+(r.ok?'완료':'실패'+(r.msg?' ('+r.msg+')':'')));}
  const onAll=[...new Set(onN.concat(revS))];
  if(onAll.length){say('판매함으로 바꾸는 중… '+onAll.length+'개');const r=await post(onAll,'T');res.push('판매함 '+onAll.length+'개: '+(r.ok?'완료':'실패'+(r.msg?' ('+r.msg+')':'')));}
  if(revD.length){say('진열함으로 바꾸는 중… '+revD.length+'개');revD.forEach(n=>{if(revS.includes(n))by[n][1]='T';});const r=await post(revD,'T','is_display');res.push('진열함 '+revD.length+'개: '+(r.ok?'완료':'실패'+(r.msg?' ('+r.msg+')':'')));}
  const after=await getAll();const payload='BJC24P1:'+JSON.stringify({at:new Date().toISOString(),items:after});let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
  box.innerHTML='';const t=document.createElement('div');t.textContent=res.join('\n')+'\n\n'+(copied?'바뀐 카페24 상품 목록도 복사해 뒀어요. 관리 사이트 [상품 관리] ② 칸에 붙여넣으면 최신으로 바뀌어요.':'')+'바뀐 카페24 상품 목록 전체(BJC24P1)를 복사해요. 관리 사이트 ② 칸에 붙여넣으세요.'+'\n카페24 상품 목록은 새로고침하면 바뀐 상태로 보여요.';box.append(t);copyBtn(payload,copied);close();return;
}
const items=await getAll();
const payload='BJC24P1:'+JSON.stringify({at:new Date().toISOString(),items});
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');
t.textContent=(copied?'복사했어요. ':'')+'카페24 상품 '+items.length+'개를 읽었어요. (판매함 '+items.filter(r=>r[1]==='T').length+'개)\n\n백정닷컴 관리 사이트 [상품 관리] ② 칸에 붙여넣으세요(Ctrl+V).';box.append(t);
if(!copied){const ta=document.createElement('textarea');ta.value=payload;ta.style.cssText='width:100%;height:80px;margin-top:8px;color:#111';box.append(ta);ta.select();const h=document.createElement('div');h.textContent='자동 복사가 막혔어요. 위 칸이 선택돼 있으니 Ctrl+C로 복사하세요.';box.append(h);}
close();
})();
