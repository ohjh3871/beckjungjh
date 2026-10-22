function dgMapOrder(o, rules, MSG){
  const nm = String(o.product || ''), opt = String(o.option || ''), qty = o.qty || 1;
  const sets = parseInt((opt.match(/(\d+)\s*세트/) || [])[1] || '1', 10);
  const no = /^\d+$/.test(o.no) ? Number(o.no) : o.no;
  const base = { no: o.no, D: '당근', E: no, J: o.name || '', K: o.addr || '', L: o.phone || '', M: o.memo || MSG };
  const optN = () => { const m = opt.match(/(?:x|×|X)\s*(\d+)/) || opt.match(/(\d+)\s*(?:팩|세트|개|봉|박스|kg|키로)/i) || opt.match(/(\d+)/); return m ? parseInt(m[1], 10) || 1 : 1; };
  const nz = t => String(t || '').replace(/\s+/g, '').toUpperCase();
  for (const r of (rules || [])){
    if (!r || !r.kw || r.off) continue;
    const kws = String(r.kw).split(/[,/]/).map(nz).filter(Boolean);
    if (!kws.length || !kws.every(k => nz(nm).includes(k))) continue;
    const b = r.qty === 'opt' ? optN() : r.qty === 'set' ? sets : 1;
    const n = Math.max(1, b * (Number(r.mult) || 1) * qty);
    if (r.split) return Array.from({ length: n }, (_, i) => ({ ...base, F: i ? 0 : o.amount, H: r.wh || '', I: `${r.item} x 1`, rule: r.id }));
    return [{ ...base, F: o.amount, H: r.wh || '', I: `${r.item} x ${n}`, rule: r.id }];
  }
  if (/우족\s*사골/.test(nm) && (sets === 1 || sets === 2))
    return [{ ...base, F: o.amount, H: '우사', I: `한우 우족사골세트 ${sets === 1 ? '6' : '12'}kg급 x ${qty}` }];
  if (/소왕구이/.test(nm))
    return [{ ...base, F: o.amount, H: '경기', I: `맛상 소왕구이 10대 x ${2 * sets * qty}` }];
  if (/등갈비/.test(nm))
    return [{ ...base, F: o.amount, H: '동해', I: `초특가 국내산 등갈비 1kg x ${Math.max(1, optN()) * qty}` }];
  if (/배터지는\s*소고기\s*한판/.test(nm)){
    const n = Math.max(1, sets * qty);
    return Array.from({ length: n }, (_, i) => ({ ...base, F: i ? 0 : o.amount, H: '창원', I: '푸짐 홈파티 세트 x 1' }));
  }
  const clean = nm.replace(/@[^@]*@/g, '').replace(/[\[【][^\]】]*[\]】]/g, '').replace(/\s+/g, ' ').trim() || nm;
  return [{ ...base, F: o.amount, H: '', I: `${clean}${opt ? ' (' + opt + ')' : ''} x ${qty}`, hold: true }];
}
