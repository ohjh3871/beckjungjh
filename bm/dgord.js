(async()=>{
if(!/store-center\.daangn\.com$/.test(location.host)||!/\/order/.test(location.pathname)){alert('당근비즈니스 [상품 판매 → 주문 관리] 화면에서 눌러주세요.');return;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const box=document.createElement('div');
box.style.cssText='position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;background:#1f2937;color:#fff;padding:16px 20px;border-radius:12px;font:14px/1.6 sans-serif;width:min(560px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35);white-space:pre-wrap';
document.body.append(box);
const say=t=>{box.textContent=t;};
const getRows=()=>[...document.querySelectorAll('div[role="row"]')].filter(r=>r.children.length>8&&/^\d+$/.test((r.children[0].textContent||'').trim()));
const sizeSel=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.value==='100')&&[...s.options].some(o=>o.value==='10'));
if(sizeSel&&sizeSel.value!=='100'){
  say('주문을 100개씩 보이게 바꾸는 중…');
  const before=getRows().length;
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(sizeSel,'100');
  sizeSel.dispatchEvent(new Event('change',{bubbles:true}));
  let last=-1,stable=0;
  for(let i=0;i<40;i++){await sleep(250);const n=getRows().length;if(n===last&&n!==before)stable++;else stable=0;last=n;if(stable>=3)break;}
}
const tabName=([...document.querySelectorAll('button[aria-selected="true"]')].map(b=>b.textContent.trim()).find(t=>/주문$/.test(t)))||'';
const targets=getRows().map(r=>{const c=[...r.children].map(x=>(x.innerText||x.textContent||'').trim().replace(/\s+/g,' '));return{no:c[0],how:c[1],st:c[2],product:c[3],option:c[5],qty:parseInt(c[6],10)||1,amount:parseInt((c[7]||'').replace(/[^\d]/g,''),10)||0,time:c[8]};}).filter(o=>/결제\s*완료/.test(o.st));
if(!targets.length){box.remove();alert('이 화면에 ‘결제완료’ 주문이 없어요.'+(tabName?'\n('+tabName+' 탭)':''));return;}
if(!confirm((tabName?'['+tabName+'] ':'')+'결제완료 주문 '+targets.length+'건을 읽고 주문수락까지 할까요?\n\n주문 상세를 하나씩 열어서 받는 사람·주소·연락처를 읽고, 다 읽힌 주문은 바로 [주문수락]을 눌러요. 주문수락은 되돌릴 수 없어요.')){box.remove();return;}
const dlg=()=>[...document.querySelectorAll('[role="dialog"]')].find(d=>(d.innerText||'').includes('주문 상세'));
const after=(lines,label)=>{const i=lines.findIndex(l=>l===label);return i>=0?(lines[i+1]||''):'';};
const out=[],fail=[],accFail=[];
for(let k=0;k<targets.length;k++){
  const o=targets[k];
  say('주문 상세 읽는 중… '+(k+1)+'/'+targets.length+'  ('+o.no+')');
  const row=getRows().find(r=>(r.children[0].textContent||'').trim()===o.no);
  if(!row){fail.push(o.no+' (목록에서 못 찾음)');continue;}
  row.children[3].click();
  let d=null;for(let i=0;i<40;i++){await sleep(150);d=dlg();if(d&&(d.innerText||'').includes(o.no)&&(d.innerText||'').includes('받는 사람'))break;}
  await sleep(250);d=dlg();
  if(!d||!(d.innerText||'').includes(o.no)){fail.push(o.no+' (상세가 안 열림)');history.back();await sleep(600);continue;}
  const lines=(d.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean);
  const name=after(lines,'받는 사람');
  let addr=after(lines,'배송지');
  const zip=(addr.match(/^\((\d{5})\)\s*/)||[])[1]||'';
  addr=addr.replace(/^\(\d{5}\)\s*/,'').trim();
  const phone=after(lines,'연락처');
  let memo='';const mi=lines.findIndex(l=>/요청|배송\s*메모|메모/.test(l)&&l.length<15);if(mi>=0)memo=lines[mi+1]||'';
  if(!name||!addr){fail.push(o.no+' (배송 정보 못 읽음 · 주문수락 안 함)');}
  else{
    let accepted=false;
    const btnAcc=()=>{const dd=dlg();return dd?[...dd.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='주문수락'):null;};
    const ab=btnAcc();
    if(ab&&!ab.disabled){
      say('주문수락 중… '+(k+1)+'/'+targets.length+'  ('+o.no+')');
      ab.click();
      for(let i=0;i<60;i++){await sleep(200);if(document.body.innerText.includes('주문 확인을 실패했어요'))break;const dd=dlg();const txt=dd?(dd.innerText||''):'';if(!btnAcc()||!/주문이 완료됐어요/.test(txt)){accepted=true;break;}}
      if(!accepted)accFail.push(o.no);
    }else accFail.push(o.no+'(버튼 없음)');
    out.push({...o,name,addr,zip,phone,memo,accepted});
  }
  history.back();
  for(let i=0;i<20;i++){await sleep(100);if(!dlg())break;}
  await sleep(200);
}
const p2=n=>String(n).padStart(2,'0');const now=new Date();
const payload='BJORD1:'+JSON.stringify({src:'당근',tab:tabName,at:now.toISOString(),orders:out});
let copied=false;try{window.focus();await navigator.clipboard.writeText(payload);copied=true;}catch(e){}
box.innerHTML='';
const t=document.createElement('div');
t.textContent=(copied?'복사했어요. ':'')+'결제완료 주문 '+out.length+'건을 읽고 '+out.filter(x=>x.accepted).length+'건 주문수락했어요.'+(accFail.length?'\n주문수락 확인 안 된 주문: '+accFail.join(', ')+' (당근 화면에서 상태를 확인해 주세요)':'')+(fail.length?'\n못 읽은 주문: '+fail.join(', '):'')+'\n\n백정닷컴 관리 사이트 [발주긁기 → 당근] 칸에 붙여넣고(Ctrl+V) [불러오기]를 누르세요.';
box.append(t);
if(!copied){const ta=document.createElement('textarea');ta.value=payload;ta.style.cssText='width:100%;height:80px;margin-top:8px;color:#111';box.append(ta);ta.select();const h=document.createElement('div');h.textContent='자동 복사가 막혔어요. 위 칸이 선택돼 있으니 Ctrl+C로 복사하세요.';box.append(h);}
const cl=document.createElement('button');cl.textContent='닫기';cl.style.cssText='margin-top:10px;background:#fff;color:#111;border:0;border-radius:6px;padding:6px 14px;cursor:pointer';cl.onclick=()=>box.remove();box.append(cl);
})();
