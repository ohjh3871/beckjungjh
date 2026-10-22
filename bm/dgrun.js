// 당근 자동 발주: node dgrun.js orders.json rules.json sheet.json > plan.json
// orders.json: {orders:[...]} (당근 발주 긁기 자동 모드 결과) · rules.json: [규칙] · sheet.json: ⭐당일발주⭐ D3:M values
const fs = require('fs');
const MSG = '소중한 고객님 상품입니다. 안전 배송 부탁드립니다 기사님!';
eval(fs.readFileSync(__dirname + '/dgmap.js', 'utf8'));
const [oP, rP, sP] = process.argv.slice(2);
const O = JSON.parse(fs.readFileSync(oP, 'utf8')); const orders = (O.orders || O).slice().sort((a, b) => String(a.time).localeCompare(String(b.time)) || String(a.no).localeCompare(String(b.no)));
const rules = JSON.parse(fs.readFileSync(rP, 'utf8') || '[]');
const S = JSON.parse(fs.readFileSync(sP, 'utf8')); const vals = S.values || S || [];
let last = -1; vals.forEach((v, i) => { if ((v || []).some(x => String(x ?? '').trim() !== '')) last = i; });
const have = new Set(vals.filter(v => String((v || [])[0] || '').trim() === '당근').map(v => String((v || [])[1] || '').replace(/\s/g, '')));
const lastRow = last < 0 ? 2 : 3 + last;
const lastIsDg = last >= 0 && String((vals[last] || [])[0] || '').trim() === '당근';
const rows = []; const dups = []; const holds = [];
orders.forEach(o => { if (have.has(String(o.no))) { dups.push(String(o.no)); return; } dgMapOrder(o, rules, MSG).forEach(r => { rows.push(r); if (r.hold) holds.push(String(o.no)); }); });
const start = lastIsDg ? lastRow + 1 : lastRow + 7, end = start + rows.length - 1;
process.stdout.write(JSON.stringify({ count: rows.length, start, end, range: rows.length ? `'⭐당일발주⭐'!D${start}:M${end}` : '', values: rows.map(r => [r.D, r.E, r.F, '', r.H, r.I, r.J, r.K, r.L, r.M]), lines: rows.map((r, i) => ({ no: String(r.no), row: start + i, I: r.I, H: r.H, hold: !!r.hold })), dups: [...new Set(dups)], holds: rows.filter(r => r.hold).map(r => String(r.no) + ' ' + r.I), orders: orders.length }, null, 0));
