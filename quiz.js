/* =====================================================================
   S영어전문학원 · 분석지 확인 문제 통합 엔진 (quiz.js)
   교과서 · 보조교재 · 모의고사 · 외부지문 시험지가 모두 이 파일 하나를 씁니다.
   시험지 파일에는 META 와 Q (문항 데이터)만 있고,
   화면, 선지 섞기, 채점, 결과표, 선생님께 보내는 기록은 이 파일이 맡습니다.
   시험지 파일의 데이터보다 '뒤에' 불러야 합니다.
   ===================================================================== */
(function () {
'use strict';

/* ---------- 화면 모양 ---------- */
const CSS = `
:root{--bg:#f7f6f2;--card:#ffffff;--ink:#1d1d1b;--muted:#6b6a64;--line:#e3e1d9;--accent:#2f5d50;--accent-soft:#e3eee9;
--ok:#1f7a4a;--ok-soft:#e4f3ea;--bad:#b23a2e;--bad-soft:#f8e6e3;--warn:#9a6a00;--warn-soft:#fbf1d8}
@media (prefers-color-scheme: dark){:root{--bg:#161714;--card:#1f201c;--ink:#ecebe5;--muted:#a3a29a;--line:#34352f;--accent:#7fbfa8;
--accent-soft:#233630;--ok:#6fcf97;--ok-soft:#1d3427;--bad:#f08b7e;--bad-soft:#3a2220;--warn:#e8c167;--warn-soft:#3a3120}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif;line-height:1.6}
.wrap{max-width:820px;margin:0 auto;padding:24px 16px 96px}
header .sec{margin:0 0 2px;color:var(--accent);font-size:.85rem;font-weight:700}
header h1{font-size:1.5rem;margin:0 0 4px;line-height:1.35}
header p{margin:0;color:var(--muted);font-size:.95rem}
.who{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 8px}.who input{flex:1;min-width:160px}
input[type=text],textarea{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font:inherit}
textarea{min-height:72px;resize:vertical}
h2{font-size:1.1rem;margin:32px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--accent)}
.q{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:12px 0}
.q.ok{border-color:var(--ok);background:linear-gradient(var(--ok-soft),var(--card) 60%)}
.q.bad{border-color:var(--bad);background:linear-gradient(var(--bad-soft),var(--card) 60%)}
.q.part{border-color:var(--warn);background:linear-gradient(var(--warn-soft),var(--card) 60%)}
.q.wait{border-color:var(--accent);border-style:dashed}
.stem{font-weight:600;margin-bottom:6px}.num{display:inline-block;min-width:2.2em;color:var(--accent)}
.ctx{background:var(--accent-soft);border-radius:8px;padding:8px 12px;margin:6px 0 10px;font-family:Georgia,"Times New Roman",serif;overflow-wrap:anywhere}
.ctx small{font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:var(--muted)}
.boxv{border:1px dashed var(--line);border-radius:8px;padding:8px 12px;margin:6px 0 10px;font-size:.95rem;color:var(--muted)}
.boxv span{display:inline-block;margin-right:14px}
.opts label{display:flex;gap:8px;align-items:flex-start;padding:6px 8px;border-radius:8px;cursor:pointer}
.opts label:hover{background:var(--accent-soft)}.opts input{margin-top:5px}
.opts.row{display:flex;gap:8px;flex-wrap:wrap}
.opts.row label{border:1px solid var(--line);padding:4px 18px}
.opts.row label:has(input:checked){border-color:var(--accent);background:var(--accent-soft);font-weight:700}
.tfrow{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;border-top:1px dashed var(--line)}
.tfrow:first-child{border-top:none}
.tfbtns{display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}
.tfbtns label{border:1px solid var(--line);border-radius:6px;padding:2px 10px;cursor:pointer}
.tfbtns input{display:none}
.tfbtns label:has(input:checked){border-color:var(--accent);background:var(--accent-soft);font-weight:700;color:var(--accent)}
.blank{display:flex;gap:8px;align-items:center;margin:6px 0}.blank span{min-width:2.5em;color:var(--muted)}
table.fix{width:100%;border-collapse:collapse;margin-top:8px}
table.fix td,table.fix th{border:1px solid var(--line);padding:6px;text-align:left;font-size:.95rem}table.fix th{background:var(--accent-soft)}table.fix td:first-child,table.fix th:first-child{white-space:nowrap;width:1%}
.fb{display:none;margin-top:10px;padding:10px 12px;border-radius:8px;background:var(--bg);font-size:.95rem}
.graded .fb{display:block}
.fb b.ok{color:var(--ok)}.fb b.bad{color:var(--bad)}.fb b.part{color:var(--warn)}.fb b.wait{color:var(--accent)}
.fb .model{margin-top:6px;padding:8px 10px;border-radius:6px;background:var(--card);border:1px solid var(--line)}
.bar{position:sticky;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px;display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;z-index:5}
.bar .prog{color:var(--muted);font-size:.9rem;margin-right:6px}
button{font:inherit;border:1px solid var(--accent);background:var(--accent);color:var(--card);padding:8px 18px;border-radius:999px;cursor:pointer;font-weight:600}
button.ghost{background:transparent;color:var(--accent)}
#result{display:none;background:var(--card);border:2px solid var(--accent);border-radius:14px;padding:18px;margin:20px 0}
#result .big{font-size:2rem;font-weight:800;color:var(--accent)}
#result table{width:100%;border-collapse:collapse;margin-top:10px}#result td,#result th{border-bottom:1px solid var(--line);padding:6px;text-align:left}
.passage{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:12px;padding:16px 18px;margin:16px 0 8px}
.passage h2{margin:0 0 8px;border:none;padding:0}
.passage .ptext{font-family:Georgia,"Times New Roman",serif;font-size:1.05rem;line-height:1.9;margin:0}
.passage sup{color:var(--accent);font-weight:700;font-family:system-ui,sans-serif;font-size:.7rem;margin-right:2px}
.passage u{text-underline-offset:4px}
.hide-ok .passage,.hide-ok .q.ok{display:none}
.muted{color:var(--muted);font-size:.9rem}
@media (max-width:560px){.tfrow{flex-direction:column;align-items:flex-start}.tfbtns{justify-content:flex-start}}
@media print{.bar{display:none}}`;

const SKELETON = `
<div class="wrap">
  <header><p class="sec" id="sec"></p><h1 id="ttl"></h1><p id="sub"></p></header>
  <div class="who"><input type="text" id="sname" placeholder="이름"><input type="text" id="sclass" placeholder="학교 / 반 / 번호"></div>
  <div id="result"></div>
  <section id="passage" class="passage"></section>
  <div id="quiz"></div>
</div>
<div class="bar"><span class="prog" id="prog"></span>
  <button id="grade">채점하기</button>
  <button class="ghost" id="toggle" style="display:none">오답만 보기</button>
  <button class="ghost" id="reset">다시 풀기</button>
</div>`;

document.head.insertAdjacentHTML('beforeend', '<style>' + CSS + '</style>');
if (!document.querySelector('meta[name=viewport]')) document.head.insertAdjacentHTML('beforeend', '<meta name="viewport" content="width=device-width, initial-scale=1">');
document.body.insertAdjacentHTML('afterbegin', SKELETON);

/* ---------- 데이터 ---------- */
const M = (typeof META !== 'undefined') ? META : {};          // eslint-disable-line no-undef
const QS = (typeof Q !== 'undefined') ? Q : [];                // eslint-disable-line no-undef
const PARTS = Object.assign({ A: 'Part A. 내용 이해', B: 'Part B. 어휘', C: 'Part C. 구문·어법', D: 'Part D. 연결어·논리 흐름', E: 'Part E. 서술형' }, M.parts || {});
const HINTS = M.hints || {};                                  // 파트 제목 아래 작은 안내 (예: 근거: 2. 구문 분석)
const TEACHER = { essay: 1, kw: 1 };                           // 언제나 선생님 채점
const MAYBE = { short: 1, blanks: 1, sent: 1, fix: 1 };        // 정답 목록과 같으면 자동 정답, 다르면 선생님 채점
const CIRC = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
const LET = ['ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ', 'ⓕ', 'ⓖ', 'ⓗ', 'ⓘ', 'ⓙ'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* 발문·제시문·지문에는 <b> <u> <i> <em> <br> <small> <sup> 만 허용 */
const rich = s => esc(s).replace(/&lt;(\/?)(b|u|i|em|br|small|sup)\s*\/?&gt;/gi, '<$1$2>');
const plain = s => { const d = document.createElement('div'); d.innerHTML = rich(s); return d.textContent.replace(/\s+/g, ' ').trim(); };
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
const normSent = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣 ]/g, ' ').replace(/\s+/g, ' ').trim();
const r2 = x => Math.round(x * 100) / 100;
function perm(n) { const p = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }

/* 선지·보기 섞기 (매번 새로 섞음) */
let ORD = {};
function shuffleAll() {
  ORD = {};
  QS.forEach(q => {
    if (q.t === 'mc' || q.t === 'choice') ORD[q.n] = perm(q.o.length);
    if (q.t === 'match') ORD[q.n] = perm(q.box.length);
  });
}
const mcText = (q, orig) => { const pos = ORD[q.n].indexOf(orig); return CIRC[pos] + ' ' + plain(q.o[orig]); };
const matchText = (q, orig) => { const pos = ORD[q.n].indexOf(orig); return LET[pos] + ' ' + plain(q.box[orig]); };

/* ---------- 문항 그리기 ---------- */
function header() {
  const man = QS.filter(q => TEACHER[q.t]).map(q => q.n), maybe = QS.filter(q => MAYBE[q.t]).map(q => q.n);
  document.title = M.title || '분석지 확인 문제';
  $('sec').textContent = M.section || '';
  $('ttl').textContent = M.title || '분석지 확인 문제';
  $('sub').textContent = `${QS.length}문항 · 문항당 1점 · 객관식은 자동 채점` +
    (man.length || maybe.length ? ` · 직접 쓰는 문항(${man.concat(maybe).sort((a, b) => a - b).join(", ")}번)은 정답과 다르면 선생님이 채점` : '');
}
function renderPassage() {
  const box = $('passage');
  if (!M.passage || !M.passage.length) { box.style.display = 'none'; return; }
  box.innerHTML = '<h2>본문</h2><p class="ptext">' + M.passage.map(([n, t]) => `<sup>#${esc(n)}</sup>${rich(t)}`).join(' ') + '</p>';
}
function render() {
  let html = '', cur = '';
  for (const q of QS) {
    if (q.p !== cur) { cur = q.p; html += `<h2>${esc(PARTS[cur] || 'Part ' + cur)}</h2>` + (HINTS[cur] ? `<p class="muted" style="margin:-4px 0 4px">${esc(HINTS[cur])}</p>` : ''); }
    html += `<div class="q" id="q${q.n}"><div class="stem"><span class="num">${esc(q.n)}.</span>${rich(q.s)}</div>`;
    if (q.c) html += `<div class="ctx">${rich(q.c)}</div>`;
    if (q.t === 'mc') html += `<div class="opts">` + ORD[q.n].map((o, i) => `<label><input type="radio" name="a${q.n}" value="${o}"><span>${CIRC[i]} ${rich(q.o[o])}</span></label>`).join('') + `</div>`;
    if (q.t === 'choice') html += `<div class="opts row">` + ORD[q.n].map(o => `<label><input type="radio" name="a${q.n}" value="${o}"><span>${rich(q.o[o])}</span></label>`).join('') + `</div>`;
    if (q.t === 'ox') html += `<div class="opts row">` + ['O', 'X'].map(v => `<label><input type="radio" name="a${q.n}" value="${v}"><span>${v}</span></label>`).join('') + `</div>`;
    if (q.t === 'tf') html += q.items.map((it, i) => `<div class="tfrow"><span>(${'abcdefgh'[i]}) ${rich(it[0])}</span><span class="tfbtns">
      <label><input type="radio" name="a${q.n}_${i}" value="T"><span>T</span></label><label><input type="radio" name="a${q.n}_${i}" value="F"><span>F</span></label></span></div>`).join('');
    if (q.t === 'match') {
      html += `<div class="boxv">[보기] ` + ORD[q.n].map((o, i) => `<span>${LET[i]} ${rich(q.box[o])}</span>`).join('') + `</div>`;
      html += q.rows.map((r, i) => `<div class="tfrow"><span>${rich(r[0])}</span><span class="tfbtns">` +
        ORD[q.n].map((o, k) => `<label><input type="radio" name="a${q.n}_${i}" value="${o}"><span>${LET[k]}</span></label>`).join('') + `</span></div>`).join('');
    }
    if (q.t === 'short') html += `<input type="text" id="a${q.n}" placeholder="답 입력" autocomplete="off" spellcheck="false">`;
    if (q.t === 'sent' || q.t === 'kw' || q.t === 'essay') html += `<textarea id="a${q.n}" placeholder="답 입력"></textarea>`;
    if (q.t === 'blanks') html += q.blanks.map((b, i) => `<div class="blank"><span>${esc(b[0])}</span><input type="text" id="a${q.n}_${i}" autocomplete="off" spellcheck="false"></div>`).join('');
    if (q.t === 'fix') html += `<table class="fix"><tr><th>번호</th><th>틀린 부분</th><th>고친 것</th></tr>` +
      q.keys.map((_, i) => `<tr><td>(${i + 1})</td><td><input type="text" id="w${q.n}_${i}"></td><td><input type="text" id="a${q.n}_${i}"></td></tr>`).join('') + `</table>`;
    html += `<div class="fb" id="fb${q.n}"></div></div>`;
  }
  $('quiz').innerHTML = html;
  $('quiz').addEventListener('input', prog); $('quiz').addEventListener('change', prog);
  prog();
}

/* ---------- 답 읽기 · 채점 ---------- */
const val = name => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; };
const txt = id => { const el = $(id); return el ? el.value.trim() : ''; };
function answered(q) {
  if (q.t === 'mc' || q.t === 'choice' || q.t === 'ox') return !!val('a' + q.n);
  if (q.t === 'tf') return q.items.some((_, i) => val(`a${q.n}_${i}`));
  if (q.t === 'match') return q.rows.some((_, i) => val(`a${q.n}_${i}`));
  if (q.t === 'blanks') return q.blanks.some((_, i) => txt(`a${q.n}_${i}`));
  if (q.t === 'fix') return q.keys.some((_, i) => txt(`a${q.n}_${i}`) || txt(`w${q.n}_${i}`));
  return !!txt('a' + q.n);
}
function prog() { $('prog').textContent = `답한 문항 ${QS.filter(answered).length} / ${QS.length}`; }

/* 문항 하나 채점 → {status, score, mine, right} */
function gradeQ(q) {
  let score = 0, mine = '', right = '', status;
  if (q.t === 'mc') { const v = val('a' + q.n); score = v !== '' && +v === q.a - 1 ? 1 : 0; mine = v === '' ? '' : mcText(q, +v); right = mcText(q, q.a - 1); }
  else if (q.t === 'choice') { const v = val('a' + q.n); score = v !== '' && q.o[+v] === q.a ? 1 : 0; mine = v === '' ? '' : plain(q.o[+v]); right = plain(q.a); }
  else if (q.t === 'ox') { const v = val('a' + q.n); score = v === q.a ? 1 : 0; mine = v; right = q.a; }
  else if (q.t === 'tf') { let c = 0; const m = []; q.items.forEach((it, i) => { const v = val(`a${q.n}_${i}`); if (v === it[1]) c++; m.push(`(${'abcdefgh'[i]}) ${v || '-'}`); });
    score = c / q.items.length; mine = m.join(' '); right = q.items.map((it, i) => `(${'abcdefgh'[i]}) ${it[1]}`).join(' '); }
  else if (q.t === 'match') { let c = 0; const m = [], r = [];
    q.rows.forEach((row, i) => { const v = val(`a${q.n}_${i}`); if (v !== '' && +v === row[1] - 1) c++;
      m.push(`${plain(row[0])} → ${v === '' ? '-' : matchText(q, +v)}`); r.push(`${plain(row[0])} → ${matchText(q, row[1] - 1)}`); });
    score = c / q.rows.length; mine = m.join(' | '); right = r.join(' | '); }
  else if (q.t === 'short') { const v = txt('a' + q.n); score = (q.ans || []).map(norm).includes(norm(v)) ? 1 : 0; mine = v; right = q.show || (q.ans || [])[0] || ''; }
  else if (q.t === 'sent') { const v = txt('a' + q.n); score = (q.ans || []).map(normSent).includes(normSent(v)) ? 1 : 0; mine = v; right = q.show || ''; }
  else if (q.t === 'blanks') { let c = 0; const m = [], used = new Set();
    q.blanks.forEach((b, i) => { const v = txt(`a${q.n}_${i}`), k = norm(v);
      /* any: true 이면 순서 상관없이, 같은 답을 두 번 쓰면 한 번만 인정 */
      if (k && b[1].map(norm).includes(k) && !(q.any && used.has(k))) { c++; used.add(k); } m.push(`${b[0]} ${v || '-'}`); });
    score = c === q.blanks.length ? 1 : 0; mine = m.join(' '); right = q.show || q.blanks.map(b => `${b[0]} ${b[1][0]}`).join(' '); }
  else if (q.t === 'fix') { const got = new Set(), m = [];
    q.keys.forEach((_, i) => { const v = txt(`a${q.n}_${i}`), w = txt(`w${q.n}_${i}`); const hit = q.keys.find(k => norm(v).includes(norm(k.k))); if (hit) got.add(hit.k); if (v || w) m.push(`${w || '?'} → ${v || '?'}`); });
    score = got.size === q.keys.length ? 1 : 0; mine = m.join(', '); right = q.keys.map(k => k.show).join(', '); }
  else if (q.t === 'kw' || q.t === 'essay') { mine = txt('a' + q.n); right = q.show || ''; }
  if (TEACHER[q.t]) status = 'manual';
  else if (MAYBE[q.t]) status = score === 1 ? 'manual-ok' : 'manual';
  else status = score === 1 ? 'correct' : score === 0 ? 'wrong' : 'part';
  return { status, score: status === 'manual' ? null : status === 'manual-ok' ? 1 : score, mine: mine || '(무응답)', right };
}

let LAST = [];
function grade() {
  LAST = QS.map(q => {
    const r = gradeQ(q), box = $('q' + q.n), fb = $('fb' + q.n);
    box.classList.remove('ok', 'bad', 'part', 'wait');
    box.classList.add(r.status === 'correct' || r.status === 'manual-ok' ? 'ok' : r.status === 'wrong' ? 'bad' : r.status === 'part' ? 'part' : 'wait');
    const ex = q.e ? `<div class="muted" style="margin-top:4px">근거: ${rich(q.e)}</div>` : '';
    if (r.status === 'manual') {
      fb.innerHTML = `<b class="wait">선생님 채점</b> · 제출하면 선생님이 채점해요.<div class="model"><b>모범 답안</b> ${rich(r.right)}${q.crit ? `<div class="muted">채점 기준: ${rich(q.crit)}</div>` : ''}</div>${ex}`;
    } else {
      const tag = r.status === 'correct' ? '<b class="ok">정답</b>' : r.status === 'manual-ok' ? '<b class="ok">정답 (모범 답안과 일치)</b>' :
        r.status === 'wrong' ? '<b class="bad">오답</b>' : `<b class="part">부분 정답 (${r2(r.score)}점)</b>`;
      fb.innerHTML = `${tag}<br>내 답: ${esc(r.mine)}<br>정답: ${esc(r.right)}${ex}`;
    }
    return Object.assign({ n: q.n, part: q.p || '', type: q.t, prompt: plain(q.s) }, r);
  });
  document.body.classList.add('graded'); $('quiz').classList.add('graded');
  summary();
  $('result').style.display = 'block'; $('toggle').style.display = 'inline-block';
  $('result').scrollIntoView({ behavior: 'smooth' });
}
function summary() {
  const tally = {}; let auto = 0; const wrong = [], pending = [];
  LAST.forEach(r => {
    const t = tally[r.part] = tally[r.part] || { s: 0, n: 0, w: 0 }; t.n++;
    if (r.status === 'manual') { pending.push(r.n); t.w++; } else { auto += r.score; t.s += r.score; if (r.score < 1) wrong.push(r.n); }
  });
  const name = $('sname').value, cls = $('sclass').value;
  const rows = Object.keys(tally).map(k => `<tr><td>${esc(PARTS[k] || k)}</td><td>${r2(tally[k].s)} / ${tally[k].n}${tally[k].w ? ` <span class="muted">(선생님 채점 ${tally[k].w})</span>` : ''}</td></tr>`).join('');
  $('result').innerHTML = `<div>${esc(name)} ${esc(cls)}</div>
    <div class="big">${r2(auto)} / ${QS.length}점</div>
    <div class="muted">자동 채점 ${r2(auto)}점${pending.length ? ` · 선생님 채점 ${pending.length}문항 (${pending.join(', ')}번)` : ''}</div>
    <table><tr><th>영역</th><th>점수</th></tr>${rows}</table>
    <p>${wrong.length ? `다시 볼 문항: ${wrong.join(', ')}` : '자동 채점 문항은 모두 맞혔어요.'}</p>`;
}
function reset() {
  if (!confirm('입력한 답을 모두 지울까요?')) return;
  shuffleAll(); render(); LAST = [];
  document.body.classList.remove('graded', 'hide-ok'); $('quiz').classList.remove('graded');
  $('result').style.display = 'none'; $('toggle').style.display = 'none'; $('toggle').textContent = '오답만 보기';
  window.scrollTo({ top: 0 });
}

/* ---------- 기록용 (track.js가 읽음) ---------- */
window.NS_TITLE = (M.section ? M.section + ' · ' : '') + (M.title || '');
window.NS_RESULT = () => (LAST.length ? LAST : QS.map(q => Object.assign({ n: q.n, part: q.p || '', type: q.t, prompt: plain(q.s) }, gradeQ(q))));

/* ---------- 시작 ---------- */
$('grade').onclick = grade;
$('toggle').onclick = e => { const on = document.body.classList.toggle('hide-ok'); e.target.textContent = on ? '전체 보기' : '오답만 보기'; };
$('reset').onclick = reset;
shuffleAll(); header(); renderPassage(); render();
})();
