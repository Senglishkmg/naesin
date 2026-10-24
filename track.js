/* =====================================================================
   S영어전문학원 내신 학습 · 기록 파일 (track.js)
   모든 페이지 맨 아래에 <script src="track.js"></script> 한 줄만 넣으면
   - 처음 들어올 때 이름을 한 번 받고
   - 어느 페이지를 열었는지, 몇 분 머물렀는지
   - 시험지에서 채점하면 문항별 결과(학생 답 / 정답 / 맞음·틀림 / 교사 채점 필요)
   를 구글 시트로 보냅니다.
   ===================================================================== */

/* ▼▼ 구글 시트 웹 앱 주소 (…/exec) 를 따옴표 안에 붙여 넣으세요 ▼▼ */
var NS_ENDPOINT = '';
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
  var PUB = { nl: '능률 오선영', mr: '미래앤 김성연' };
  var SUP = { olympus1: '올림포스 영어독해의 기본 1', olympus2: '올림포스 영어독해의 기본 2', 'rp-type-basic': '리딩파워 유형편 기본',
    'rp-type-complete': '리딩파워 유형편 완성', 'rp-topic-complete': '리딩파워 주제별 독해 완성', 'nsnr-basic': '능수능란 기본편', 'sst-light': '수능특강 라이트' };
  var EXT = { mokyeogo: '목여고' };
  var FIXED = { index: '메인', textbook: '교과서 목록', supplement: '보조교재 목록', mock: '모의고사 목록', external: '외부지문 목록' };
  function label(f) {
    if (FIXED[f]) return FIXED[f];
    var m;
    if ((m = f.match(/^tb-([a-z0-9]+)(?:-([a-z]+))?(?:-(L\d+|SL))?(?:-s(\d+))?$/))) {
      var out = [SUBJ[m[1]] || m[1]];
      if (m[2]) out.push(PUB[m[2]] || m[2]);
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
  var student = store.get('ns_student', null);   // {name, cls}
  function send(obj) {
    if (!NS_ENDPOINT) { console.log('[기록 — 시트 주소 미설정]', obj); return; }
    var body = JSON.stringify(obj);
    /* 페이지를 떠나는 순간에도 끊기지 않게 keepalive 로 보냄 (안 되는 브라우저는 sendBeacon) */
    try { fetch(NS_ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: body.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body }); return; } catch (e) { }
    try { if (navigator.sendBeacon) navigator.sendBeacon(NS_ENDPOINT, body); } catch (e) { }
  }
  function base(event) {
    return { event: event, clientTime: new Date().toISOString(), student: student ? student.name : '', cls: student ? student.cls : '', page: PAGE, file: file + '.html' };
  }

  /* ---------- 이름 입력 ---------- */
  function askName(done) {
    var wrap = document.createElement('div');
    wrap.setAttribute('style', 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Noto Sans KR",-apple-system,"Malgun Gothic",sans-serif');
    wrap.innerHTML = '<form style="background:#fff;border-radius:16px;padding:24px;max-width:360px;width:100%;box-shadow:0 20px 40px -10px rgba(0,0,0,.4)">'
      + '<div style="font-size:13px;font-weight:800;color:#0284c7">S영어전문학원 내신 학습</div>'
      + '<div style="font-size:20px;font-weight:900;margin:4px 0 6px;color:#0f172a">이름을 입력하세요</div>'
      + '<div style="font-size:13px;color:#64748b;margin-bottom:14px">공부한 기록과 채점 결과가 이 이름으로 선생님께 전달돼요.</div>'
      + '<input name="n" placeholder="이름" required style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;font:inherit;font-size:16px;margin-bottom:8px">'
      + '<input name="c" placeholder="학교 / 반 / 번호 (선택)" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;font:inherit;font-size:15px;margin-bottom:14px">'
      + '<button style="width:100%;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:800;font-size:16px;background:#0284c7;color:#fff;cursor:pointer">시작하기</button></form>';
    document.body.appendChild(wrap);
    var f = wrap.querySelector('form');
    setTimeout(function () { f.n.focus(); }, 50);
    f.onsubmit = function (e) {
      e.preventDefault();
      var n = f.n.value.trim(); if (!n) return;
      student = { name: n, cls: f.c.value.trim() }; store.set('ns_student', student);
      wrap.remove(); done();
    };
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
      var QS = getQ(); if (!QS || !student) return;
      var items;
      try { items = (typeof window.gradeQ === 'function' || document.getElementById('grade')) ? readA(QS) : readB(QS); }
      catch (e) { console.warn('채점 결과를 읽지 못했어요', e); return; }
      var sig = JSON.stringify(items.map(function (i) { return [i.n, i.mine]; }));
      if (sig === lastSig) return;                       // 같은 답으로 채점 버튼을 또 누른 경우는 한 번만
      lastSig = sig; store.set('ns_lastsig_' + file, sig);
      var att = store.get('ns_att_' + file, 0) + 1; store.set('ns_att_' + file, att);
      var meta = getMeta(), auto = 0;
      items.forEach(function (i) { if (i.status === 'manual-ok') auto += 1; else if (i.score != null) auto += i.score; });
      var o = base('grade');
      o.sheetTitle = meta.title || document.title; o.section = meta.section || '';
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
    var m = file.match(/^(tb-[a-z0-9]+-[a-z]+-(?:L\d+|SL))-s\d+$/) || file.match(/^(mock-g\d-\d{4}-\d{2})-.+$/) || file.match(/^(ext-[a-z]+)-.+$/) || file.match(/^(sup-[a-z0-9-]+?)-(?:u|L|s)\d+.*$/);
    if (!m) return;
    var parent = m[1], a = document.createElement('a');
    a.href = parent + '.html';
    a.textContent = '← ' + label(parent).split(' · ').pop() + '(으)로 돌아가기';
    a.setAttribute('style', 'display:block;padding:10px 16px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;color:#0369a1;font-weight:800;font-size:14px;text-decoration:none;font-family:"Noto Sans KR",-apple-system,"Malgun Gothic",sans-serif');
    document.body.insertBefore(a, document.body.firstChild);
  }

  /* ---------- 시작 ---------- */
  function start() {
    backBar();
    var go = function () {
      var s1 = document.getElementById('sname'), s2 = document.getElementById('sclass');   // 섹션 1 시험지의 이름 칸 자동 채움
      if (s1 && !s1.value) s1.value = student.name;
      if (s2 && !s2.value) s2.value = student.cls || '';
      send(base('open'));
    };
    if (!student) askName(go); else go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
