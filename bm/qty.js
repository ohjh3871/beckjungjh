(async()=>{
if(!/service\.masterc\.co\.kr$/.test(location.host)){alert('마스터 수량 화면(service.masterc.co.kr/qty)에서 눌러주세요.');return;}
const box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';document.body.append(box);
const say=t=>{box.textContent=t;};
const tabs=[...document.querySelectorAll('a.chip.wh')].map(a=>{try{return new URL(a.href).searchParams.get('tab');}catch(e){return null;}}).filter(t=>t&&t!=='*');
if(!tabs.length){box.remove();alert('창고 목록을 찾지 못했어요. 수량 화면(…/qty/)에서 눌러주세요.');return;}
const num=t=>{const n=parseInt(String(t||'').replace(/[^\d-]/g,''),10);return isNaN(n)?0:n;};
const rows=[],fail=[];
for(let i=0;i<tabs.length;i++){
  say('마스터 수량·공급가 읽는 중… '+(i+1)+'/'+tabs.length+' ('+rows.length+'개)');
  const u=new URL('/qty/',location.origin);u.searchParams.set('tab',tabs[i]);u.searchParams.set('sec','');
  let h='';for(let k=0;k<3&&!h;k++){try{const r=await fetch(u,{credentials:'include'});if(r.ok)h=await r.text();}catch(e){}}
  if(!h){fail.push(tabs[i]);continue;}
  const d=new DOMParser().parseFromString(h,'text/html');
  const hrs=[...d.querySelectorAll('thead tr')].map(tr=>[...tr.children].map(th=>th.textContent.replace(/\s+/g,'')));
  const hs=hrs.find(r=>r.some(x=>x.indexOf('상품명')===0))||[];
  const ix=k=>hs.findIndex(x=>x.indexOf(k)===0);
  const iN0=ix('상품명'),iP0=ix('공급가'),iT0=ix('총수량'),iR0=ix('잔여');
  if(iN0<0||iT0<0){fail.push(tabs[i]);continue;}
  [...d.querySelectorAll('tbody tr')].forEach(tr=>{const c=tr.children;
    /* 머리줄과 본문 칸 수가 다를 수 있어서, 상품명 링크(a.nml)가 있는 칸 기준으로 위치를 맞춰요 */
    const nIdx=[...c].findIndex(td=>td.querySelector('a.nml'));const sh=nIdx>=0?nIdx-iN0:0;
    const iN=iN0+sh,iP=iP0>=0?iP0+sh:-1,iT=iT0+sh,iR=iR0>=0?iR0+sh:-1;if(c.length<=Math.max(iN,iT))return;const a=c[iN].querySelector('a.nml');const nm=(a?a.textContent:c[iN].textContent).trim().replace(/\s+/g,' ');if(!nm)return;
    const id=a?((a.getAttribute('href')||'').match(/(\d{5,})/)||[])[1]||'':'';
    const lock=c[iN].querySelector('.tag.rfs')?1:0;
    const tT=(c[iT].textContent||'').replace(/\s+/g,''),tR=iR>=0?(c[iR].textContent||'').replace(/\s+/g,''):'';const ample=/넉넉/.test(tR)||/^0{2,}$/.test(tT)?1:0;
    rows.push([String(tabs[i]).replace(/\d+$/,''),nm,ample?999:num(tT),ample?999:(iR>=0?num(tR):0),iP>=0?num(c[iP].textContent):0,id,lock,ample]);});
}
const day=((document.body.innerText||'').match(/📅[^\n]*/)||[''])[0].replace('📅','').trim();
const payload='BJQTY1:'+JSON.stringify({at:new Date().toISOString(),day,v:2,rows});
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';const t=document.createElement('div');
const lk=rows.filter(r=>r[6]).length;
t.textContent=(copied?'복사했어요. ':'')+'마스터 상품 '+rows.length+'개를 읽었어요. (총수량 0 = 품절 '+rows.filter(r=>r[2]===0&&!r[6]).length+'개'+(rows.some(r=>r[7])?', 넉넉 '+rows.filter(r=>r[7]).length+'개':'')+(lk?', 수량최신화 전 '+lk+'개':'')+')'+(day?'\n기준: '+day:'')+(fail.length?'\n못 읽은 창고: '+fail.join(', '):'')+'\n\n백정닷컴 관리 사이트 [상품 관리] ① 칸에 붙여넣으세요(Ctrl+V).';box.append(t);
if(!copied){const ta=document.createElement('textarea');ta.value=payload;ta.style.cssText='width:100%;height:80px;margin-top:8px;color:#111';box.append(ta);ta.select();const h=document.createElement('div');h.textContent='자동 복사가 막혔어요. 위 칸이 선택돼 있으니 Ctrl+C로 복사하세요.';box.append(h);}
const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);
})();
