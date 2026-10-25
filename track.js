/* =====================================================================
   S영어전문학원 내신 학습 · 기록 파일 (track.js)
   모든 페이지 맨 아래에 <script src="track.js"></script> 한 줄만 넣으면
   - 처음 들어올 때 학년·반·이름과 비번(숫자 4자리)을 한 번 받고 (다른 기기에서는 비번만)
   - 어느 페이지를 열었는지, 몇 분 머물렀는지
   - 시험지에서 채점하면 문항별 결과(학생 답 / 정답 / 맞음·틀림 / 교사 채점 필요)
   를 구글 시트로 보냅니다.
   ===================================================================== */

/* ▼▼ 구글 시트 웹 앱 주소 (…/exec) 를 따옴표 안에 붙여 넣으세요 ▼▼ */
var NS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyBNM5j8YykQe6VEDAngq5uFo-nsbFCPZoLjKFGo6LirdeXZXhiWoD8XbfiJxYUCdUI/exec';
/* ▲▲ 여기만 고치면 됩니다 ▲▲ */

(function () {
  'use strict';
  window.NS_ENDPOINT = NS_ENDPOINT;
  var me = document.currentScript;
  if (me && me.hasAttribute('data-no-log')) return;      // 선생님 페이지는 기록하지 않음

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '') || 'index';

  /* ---------- 파일 이름 → 알아보기 쉬운 이름 ---------- */
  var SUBJ = { common1: '공통영어1', common2: '공통영어2', english1: '영어1', en1: '영어1', english2: '영어2', en2: '영어2' };
  var PUB = {   // 교과목별 출판사 약자
    en2: { nl: '능률 오선영', mr: '미래앤 김성연' },
    common2: { cj: '천재 조수경', ss1: '시사 박준언', ss2: '시사 김은형', bs: '비상 홍민표', nl: '능률 민병천' }
  };
  var SUP = { olympus1: '올림포스 영어독해의 기본 1', olympus2: '올림포스 영어독해의 기본 2', 'rp-type-basic': '리딩파워 유형편 기본',
    'rp-type-complete': '리딩파워 유형편 완성', 'rp-topic-complete': '리딩파워 주제별 독해 완성', 'nsnr-basic': '능수능란 기본편', 'sst-light': '수능특강 라이트' };
  var EXT = { mokyeogo: '목여고' };
  var FIXED = { index: '메인', my: '내 결과', textbook: '교과서 목록', supplement: '보조교재 목록', mock: '모의고사 목록', external: '외부지문 목록' };
  function label(f) {
    if (FIXED[f]) return FIXED[f];
    var m;
    if ((m = f.match(/^tb-([a-z0-9]+)(?:-([a-z][a-z0-9]*))?(?:-(L\d+|SL))?(?:-s(\d+))?$/))) {
      var out = [SUBJ[m[1]] || m[1]];
      if (m[2]) out.push((PUB[m[1]] || {})[m[2]] || m[2]);
      if (m[3]) out.push(m[3] === 'SL' ? 'Special Lesson' : m[3].slice(1) + '과');
      if (m[4]) out.push('섹션 ' + m[4]);
      return out.join(' · ');
    }
    if ((m = f.match(/^mock-g(\d)-(\d{4})-(\d{2})(?:-(.+))?$/))) return '모의고사 · 고' + m[1] + ' · ' + m[2] + '년 ' + (+m[3]) + '월' + (m[4] ? ' · ' + m[4] : '');
    if ((m = f.match(/^sup-(.+)$/))) { var k = Object.keys(SUP).find(function (x) { return m[1].indexOf(x) === 0; }); return '보조교재 · ' + (k ? SUP[k] + (m[1].slice(k.length) ? ' · ' + m[1].slice(k.length + 1) : '') : m[1]); }
    if ((m = f.match(/^ext-([a-z]+)(?:-(.+))?$/))) return '외부지문 · ' + (EXT[m[1]] || m[1]) + (m[2] ? ' · ' + m[2] : '');
    return document.title || f;
  }
  var PAGE = label(file);

  /* ---------- 보내기 ---------- */
  var student = store.get('ns_student', null);   // {sid, name, cls, pin}
  if (student && !student.sid) student = null;      // 비번 도입 전 기록 → 비번을 새로 정하게
  window.NS_STUDENT = student;
  function send(obj) {
    if (!NS_ENDPOINT) { console.log('[기록 — 시트 주소 미설정]', obj); return; }
    var body = JSON.stringify(obj);
    /* 페이지를 떠나는 순간에도 끊기지 않게 keepalive 로 보냄 (안 되는 브라우저는 sendBeacon) */
    try { fetch(NS_ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: body.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body }); return; } catch (e) { }
    try { if (navigator.sendBeacon) navigator.sendBeacon(NS_ENDPOINT, body); } catch (e) { }
  }
  function base(event) {
    return { event: event, clientTime: new Date().toISOString(), student: student ? student.name : '', cls: student ? student.cls : '', sid: student ? student.sid : '', page: PAGE, file: file + '.html' };
  }

  /* ---------- 학생 확인 (처음: 학년·반·이름·비번 / 다음부터: 비번만) ---------- */
  function api(params) {
    return fetch(NS_ENDPOINT + '?' + new URLSearchParams(params).toString()).then(function (r) { return r.json(); });
  }
  var MSG = {
    taken: '이 번호는 다른 학생이 쓰고 있어요. 다른 숫자 4개를 골라 주세요.',
    exists: '이미 등록한 학생이에요. 위의 「비번이 있어요」를 눌러 비번으로 들어오세요. 비번이 기억나지 않으면 선생님께 물어보세요.',
    pin: '맞는 비번이 없어요. 다시 확인해 주세요. 기억나지 않으면 선생님께 물어보세요.',
    input: '빈칸을 모두 채워 주세요.',
    net: '연결이 안 됐어요. 인터넷을 확인하고 다시 눌러 주세요.'
  };
  function askStudent(done, old) {
    var wrap = document.createElement('div');
    var F = 'width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;font:inherit;font-size:16px;margin-bottom:8px;background:#fff';
    var T = 'flex:1;border:0;border-radius:8px;padding:9px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;';
    wrap.setAttribute('style', 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;font-family:"Noto Sans KR",-apple-system,"Malgun Gothic",sans-serif');
    wrap.innerHTML = '<div style="background:#fff;border-radius:16px;padding:22px;max-width:360px;width:100%;box-shadow:0 20px 40px -10px rgba(0,0,0,.4);margin:auto">'
      + '<div style="font-size:13px;font-weight:800;color:#0284c7">S영어전문학원 내신 학습</div>'
      + '<div style="display:flex;gap:6px;background:#f1f5f9;border-radius:10px;padding:4px;margin:10px 0 14px">'
      + '<button type="button" data-tab="new" style="' + T + '">처음이에요</button><button type="button" data-tab="have" style="' + T + '">비번이 있어요</button></div>'
      + '<form data-form="new">'
      + '<div style="font-size:19px;font-weight:900;margin:0 0 4px;color:#0f172a">나를 등록해요</div>'
      + '<div style="font-size:13px;color:#64748b;margin-bottom:12px">한 번만 하면 돼요. 다른 기기에서는 비번만 넣으면 들어올 수 있어요.</div>'
      + '<div style="display:flex;gap:8px"><select name="g" required style="' + F + '"><option value="">학년</option><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>'
      + '<input name="b" placeholder="반 (숫자)" inputmode="numeric" required style="' + F + '"></div>'
      + '<input name="n" placeholder="이름" required style="' + F + '">'
      + '<input name="p" type="password" placeholder="비번 (숫자 4자리)" inputmode="numeric" maxlength="4" autocomplete="new-password" required style="' + F + '">'
      + '<input name="p2" type="password" placeholder="비번 한 번 더" inputmode="numeric" maxlength="4" autocomplete="new-password" required style="' + F + '">'
      + '<div style="font-size:12.5px;color:#64748b;margin:0 2px 12px">비번은 꼭 기억해 두세요. 내 결과를 볼 때도 써요.</div>'
      + '<div data-err style="display:none;color:#b91c1c;font-size:13.5px;font-weight:700;margin-bottom:10px"></div>'
      + '<button style="width:100%;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:800;font-size:16px;background:#0284c7;color:#fff;cursor:pointer">등록하고 시작하기</button></form>'
      + '<form data-form="have" style="display:none">'
      + '<div style="font-size:19px;font-weight:900;margin:0 0 4px;color:#0f172a">비번을 넣어 주세요</div>'
      + '<div style="font-size:13px;color:#64748b;margin-bottom:12px">처음 등록할 때 정한 숫자 4자리예요.</div>'
      + '<input name="p" type="password" placeholder="비번 (숫자 4자리)" inputmode="numeric" maxlength="4" autocomplete="current-password" required style="' + F + 'font-size:20px;letter-spacing:.3em;text-align:center">'
      + '<div data-err style="display:none;color:#b91c1c;font-size:13.5px;font-weight:700;margin:4px 0 10px"></div>'
      + '<button style="width:100%;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:800;font-size:16px;background:#0284c7;color:#fff;cursor:pointer;margin-top:6px">들어가기</button></form>'
      + '</div>';
    document.body.appendChild(wrap);
    var fNew = wrap.querySelector('[data-form=new]'), fHave = wrap.querySelector('[data-form=have]');
    function tab(t) {
      fNew.style.display = t === 'new' ? '' : 'none'; fHave.style.display = t === 'have' ? '' : 'none';
      wrap.querySelectorAll('[data-tab]').forEach(function (b) { var on = b.getAttribute('data-tab') === t; b.style.background = on ? '#fff' : 'transparent'; b.style.color = on ? '#0369a1' : '#64748b'; b.style.boxShadow = on ? '0 1px 3px rgba(0,0,0,.15)' : 'none'; });
      setTimeout(function () { (t === 'new' ? (old ? fNew.p : fNew.g) : fHave.p).focus(); }, 50);
    }
    wrap.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab(b.getAttribute('data-tab')); }; });
    if (old && old.name) fNew.n.value = old.name;
    tab('new');
    function err(f, k) { var e = f.querySelector('[data-err]'); e.textContent = MSG[k] || k; e.style.display = k ? 'block' : 'none'; }
    function busy(f, on) { var b = f.querySelector('button:not([type])'); b.disabled = on; b.style.opacity = on ? '.6' : '1'; }
    function finish(f, s, pin) {
      if (!s || !s.student) { busy(f, false); return err(f, (s && s.error) || 'net'); }
      student = { sid: s.student.sid, name: s.student.name, cls: s.student.cls, pin: pin };
      store.set('ns_student', student); window.NS_STUDENT = student;
      wrap.remove(); done();
      try { window.dispatchEvent(new CustomEvent('ns-student', { detail: student })); } catch (e) { }
    }
    fNew.onsubmit = function (e) {
      e.preventDefault(); err(fNew, '');
      var p = fNew.p.value.trim(), b = fNew.b.value.replace(/[^0-9]/g, ''), n = fNew.n.value.trim();
      if (!fNew.g.value || !b || !n) return err(fNew, 'input');
      if (!/^\d{4}$/.test(p)) return err(fNew, '비번은 숫자 4자리로 정해 주세요.');
      if (p !== fNew.p2.value.trim()) return err(fNew, '두 번 넣은 비번이 달라요. 다시 확인해 주세요.');
      busy(fNew, true);
      api({ action: 'register', grade: fNew.g.value, ban: b, name: n, pin: p }).then(function (d) { finish(fNew, d, p); }, function () { finish(fNew, null); });
    };
    fHave.onsubmit = function (e) {
      e.preventDefault(); err(fHave, '');
      var p = fHave.p.value.trim();
      if (!/^\d{4}$/.test(p)) return err(fHave, '비번은 숫자 4자리예요.');
      busy(fHave, true);
      api({ action: 'login', pin: p }).then(function (d) { finish(fHave, d, p); }, function () { finish(fHave, null); });
    };
  }
  /* 다른 학생으로 바꾸기 (같은 기기를 여럿이 쓸 때) */
  window.NS_SWITCH = function () {
    try { localStorage.removeItem('ns_student'); } catch (e) { }
    student = null; window.NS_STUDENT = null; location.reload();
  };

  /* 메인 화면에 「OOO 학생으로 공부 중」 줄 */
  function whoBar() {
    if (file !== 'index' || !student) return;
    var h = document.querySelector('header'); if (!h) return;
    var d = document.createElement('div');
    d.setAttribute('style', 'text-align:center;font-size:14px;color:#64748b;margin:-8px 0 16px');
    d.innerHTML = '<b style="color:#0f172a"></b> 학생으로 공부 중 · <a href="#" style="color:#0369a1;font-weight:700">내가 아니에요</a>';
    d.querySelector('b').textContent = student.name + ' (' + student.cls + ')';
    d.querySelector('a').onclick = function (e) { e.preventDefault(); window.NS_SWITCH(); };
    h.parentNode.insertBefore(d, h.nextSibling);
  }

  /* ---------- 접속 · 머문 시간 ---------- */
  var openedAt = Date.now(), activeMs = 0, activeFrom = document.hidden ? null : Date.now(), leftSent = false;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (activeFrom) { activeMs += Date.now() - activeFrom; activeFrom = null; } sendLeave(); }
    else { activeFrom = Date.now(); leftSent = false; }
  });
  window.addEventListener('pagehide', function () { if (activeFrom) { activeMs += Date.now() - activeFrom; activeFrom = null; } sendLeave(); });
  function sendLeave() {
    if (leftSent || !student) return; leftSent = true;
    var o = base('leave'); o.activeSec = Math.round(activeMs / 1000); o.totalSec = Math.round((Date.now() - openedAt) / 1000); send(o);
  }

  /* ---------- 시험지 채점 결과 읽기 ---------- */
  var CIRC = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
  var MANUAL_TYPES = { short: 1, sent: 1, kw: 1, blanks: 1, fix: 1 };
  function getQ() { try { return typeof Q !== 'undefined' && Array.isArray(Q) ? Q : null; } catch (e) { return null; } }   // eslint-disable-line no-undef
  function getMeta() { try { return typeof META !== 'undefined' ? META : {}; } catch (e) { return {}; } }                    // eslint-disable-line no-undef
  function v(id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; }
  function checked(name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function mcText(q, i) { i = +i; return i ? CIRC[i - 1] + (q.o && q.o[i - 1] ? ' ' + q.o[i - 1] : '') : ''; }
  function rightOf(q) {
    if (q.t === 'mc') return mcText(q, q.a);
    if (q.t === 'choice') return String(q.a);
    if (q.t === 'tf') return (q.items || []).map(function (it, i) { return '(' + (i + 1) + ') ' + it[1]; }).join(' ');
    if (q.t === 'fix') return (q.keys || []).map(function (k) { return k.show; }).join(' / ');
    return q.show || (q.ans ? q.ans[0] : '');
  }

  /* 형식 A: 섹션 1처럼 gradeQ(q) 함수가 있는 시험지 */
  function readA(QS) {
    return QS.map(function (q) {
      var r = window.gradeQ ? window.gradeQ(q) : null; if (!r) { try { r = gradeQ(q); } catch (e) { r = { score: 0, mine: '', right: '' }; } }   // eslint-disable-line no-undef
      var manual = !!MANUAL_TYPES[q.t], mine = r.mine;
      if (q.t === 'mc') mine = checked('a' + q.n) ? mcText(q, checked('a' + q.n)) : '(무응답)';
      var status = manual ? (r.score === 1 ? 'manual-ok' : 'manual') : r.score === 1 ? 'correct' : r.score === 0 ? 'wrong' : 'part';
      return { n: q.n, part: q.p || '', type: q.t, prompt: q.s || '', mine: mine || '(무응답)', right: q.t === 'mc' ? mcText(q, q.a) : (r.right || rightOf(q)), status: status, score: manual ? null : r.score };
    });
  }
  /* 형식 B: 섹션 2~6처럼 res-번호 칸에 결과를 표시하는 시험지 */
  function readB(QS) {
    return QS.map(function (q) {
      var mine = '';
      if (q.t === 'mc') { var c = checked('ans-' + q.n); mine = c ? mcText(q, c) : ''; }
      else if (q.t === 'tf') mine = (q.items || []).map(function (_, i) { return '(' + (i + 1) + ') ' + (v('ans-' + q.n + '-' + i) || '-'); }).join(' ');
      else if (q.t === 'blanks') mine = (q.blanks || []).map(function (b, i) { return (b[0] || '(' + (i + 1) + ')') + ' ' + (v('ans-' + q.n + '-' + i) || '-'); }).join(' ');
      else if (q.t === 'fix') mine = (q.keys || []).map(function (_, i) { return v('ans-' + q.n + '-' + i); }).filter(Boolean).join(', ');
      else mine = v('ans-' + q.n);
      var res = document.getElementById('res-' + q.n), cls = res ? res.className : '';
      var manual = !!MANUAL_TYPES[q.t];
      var status = /correct/.test(cls) ? (manual ? 'manual-ok' : 'correct') : /wrong/.test(cls) ? 'wrong' : manual ? 'manual' : 'wrong';
      return { n: q.n, part: q.p || '', type: q.t, prompt: q.s || '', mine: mine || '(무응답)', right: rightOf(q), status: status, score: manual ? null : status === 'correct' ? 1 : 0 };
    });
  }

  var lastSig = store.get('ns_lastsig_' + file, '');
  function onGrade() {
    setTimeout(function () {
      if (!student) return;
      var items, QS = getQ();
      try {
        if (typeof window.NS_RESULT === 'function') items = window.NS_RESULT();   // 엔진이 직접 결과를 주는 시험지 (analysis.js 등)
        else if (!QS) return;
        else items = (typeof window.gradeQ === 'function' || document.getElementById('grade')) ? readA(QS) : readB(QS);
      }
      catch (e) { console.warn('채점 결과를 읽지 못했어요', e); return; }
      var sig = JSON.stringify(items.map(function (i) { return [i.n, i.mine]; }));
      if (sig === lastSig) return;                       // 같은 답으로 채점 버튼을 또 누른 경우는 한 번만
      lastSig = sig; store.set('ns_lastsig_' + file, sig);
      var att = store.get('ns_att_' + file, 0) + 1; store.set('ns_att_' + file, att);
      var meta = getMeta(), auto = 0;
      items.forEach(function (i) { if (i.status === 'manual-ok') auto += 1; else if (i.score != null) auto += i.score; });
      var o = base('grade');
      o.sheetTitle = meta.title || window.NS_TITLE || document.title; o.section = meta.section || '';
      o.attempt = att; o.total = items.length; o.autoScore = Math.round(auto * 100) / 100;
      o.manualCount = items.filter(function (i) { return i.status === 'manual'; }).length;
      o.items = items;
      send(o);
    }, 400);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button, input[type=button], input[type=submit]');
    if (!b) return;
    if (b.id === 'grade' || b.id === 'btn-grade' || /채점/.test(b.textContent || b.value || '')) onGrade();
  }, true);

  /* ---------- 시험지에 「← 단원으로」 버튼 ---------- */
  function backBar() {
    var m = file.match(/^(tb-[a-z0-9]+-[a-z][a-z0-9]*-(?:L\d+|SL))-s\d+$/) || file.match(/^(mock-g\d-\d{4}-\d{2})-.+$/) || file.match(/^(ext-[a-z]+)-.+$/) || file.match(/^(sup-[a-z0-9-]+?)-(?:u|L|s)\d+.*$/);
    if (!m) return;
    var parent = m[1], bar = document.createElement('div'), a = document.createElement('a'), my = document.createElement('a');
    bar.setAttribute('style', 'display:flex;align-items:center;gap:10px;padding:10px 16px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;font-weight:800;font-size:14px;font-family:"Noto Sans KR",-apple-system,"Malgun Gothic",sans-serif');
    a.href = parent + '.html';
    a.textContent = '← ' + label(parent).split(' · ').pop() + '(으)로 돌아가기';
    a.setAttribute('style', 'color:#0369a1;text-decoration:none');
    my.href = 'my.html'; my.textContent = '내 결과';
    my.setAttribute('style', 'margin-left:auto;color:#0369a1;text-decoration:none;border:1px solid #bae6fd;background:#fff;border-radius:999px;padding:3px 12px;font-size:13px');
    bar.appendChild(a); bar.appendChild(my);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  /* ---------- 시작 ---------- */
  function start() {
    backBar();
    var go = function () {
      var s1 = document.getElementById('sname'), s2 = document.getElementById('sclass');   // 섹션 1 시험지의 이름 칸 자동 채움
      if (s1 && !s1.value) s1.value = student.name;
      if (s2 && !s2.value) s2.value = student.cls || '';
      whoBar();
      send(base('open'));
    };
    if (!student) askStudent(go, store.get('ns_student', null)); else go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
