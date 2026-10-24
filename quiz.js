/* =====================================================================
   S영어전문학원 · 분석지 정독 확인 문항 엔진 (quiz.js)
   시험지 파일에는 META 와 Q(문항 데이터)만 들어 있고,
   화면 모양과 채점은 모두 이 파일이 맡습니다.
   시험지 파일보다 '뒤에' 불러야 합니다:
     <script> const META = ...; const Q = [...]; </script>
     <script src="https://senglishkmg.github.io/naesin/quiz.js"></script>
   ===================================================================== */
document.head.insertAdjacentHTML('beforeend', '<style>' + ":root{\n  --bg:#f7f6f2; --card:#ffffff; --ink:#1d1d1b; --muted:#6b6a64; --line:#e3e1d9;\n  --accent:#2f5d50; --accent-soft:#e3eee9; --ok:#1f7a4a; --ok-soft:#e4f3ea;\n  --bad:#b23a2e; --bad-soft:#f8e6e3; --warn:#9a6a00; --warn-soft:#fbf1d8;\n}\n@media (prefers-color-scheme: dark){\n  :root{\n    --bg:#161714; --card:#1f201c; --ink:#ecebe5; --muted:#a3a29a; --line:#34352f;\n    --accent:#7fbfa8; --accent-soft:#233630; --ok:#6fcf97; --ok-soft:#1d3427;\n    --bad:#f08b7e; --bad-soft:#3a2220; --warn:#e8c167; --warn-soft:#3a3120;\n  }\n}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--bg);color:var(--ink);\n  font-family:\"Pretendard\",\"Apple SD Gothic Neo\",\"Noto Sans KR\",system-ui,sans-serif;line-height:1.6}\n.wrap{max-width:820px;margin:0 auto;padding:24px 16px 80px}\nheader h1{font-size:1.5rem;margin:0 0 4px}\nheader p{margin:0;color:var(--muted);font-size:.95rem}\n.who{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 8px}\n.who input{flex:1;min-width:160px}\ninput[type=text],textarea{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;\n  background:var(--card);color:var(--ink);font:inherit}\ntextarea{min-height:64px;resize:vertical}\nh2{font-size:1.1rem;margin:32px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--accent)}\n.q{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:12px 0}\n.q.ok{border-color:var(--ok);background:linear-gradient(var(--ok-soft),var(--card) 60%)}\n.q.bad{border-color:var(--bad);background:linear-gradient(var(--bad-soft),var(--card) 60%)}\n.q.part{border-color:var(--warn);background:linear-gradient(var(--warn-soft),var(--card) 60%)}\n.stem{font-weight:600;margin-bottom:6px}\n.num{display:inline-block;min-width:2.2em;color:var(--accent)}\n.ctx{background:var(--accent-soft);border-radius:8px;padding:8px 12px;margin:6px 0 10px;font-family:Georgia,serif}\n.opts label{display:flex;gap:8px;align-items:flex-start;padding:6px 8px;border-radius:8px;cursor:pointer}\n.opts label:hover{background:var(--accent-soft)}\n.opts input{margin-top:5px}\n.tfrow{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:6px 0;border-top:1px dashed var(--line)}\n.tfrow:first-child{border-top:none}\n.tfbtns{display:flex;gap:6px;flex-shrink:0}\n.tfbtns label{border:1px solid var(--line);border-radius:6px;padding:2px 10px;cursor:pointer}\n.tfbtns input{display:none}\n.tfbtns input:checked+span{font-weight:700;color:var(--accent)}\n.tfbtns label:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}\n.blank{display:flex;gap:8px;align-items:center;margin:6px 0}\n.blank span{min-width:2.5em;color:var(--muted)}\ntable.fix{width:100%;border-collapse:collapse;margin-top:8px}\ntable.fix td,table.fix th{border:1px solid var(--line);padding:6px;text-align:left;font-size:.95rem}\ntable.fix th{background:var(--accent-soft)}\n.fb{display:none;margin-top:10px;padding:10px 12px;border-radius:8px;background:var(--bg);font-size:.95rem}\n.graded .fb{display:block}\n.fb b.ok{color:var(--ok)} .fb b.bad{color:var(--bad)} .fb b.part{color:var(--warn)}\n.bar{position:sticky;bottom:0;background:var(--card);border-top:1px solid var(--line);\n  padding:12px 16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;z-index:5}\nbutton{font:inherit;border:1px solid var(--accent);background:var(--accent);color:var(--card);\n  padding:8px 18px;border-radius:999px;cursor:pointer;font-weight:600}\nbutton.ghost{background:transparent;color:var(--accent)}\n#result{display:none;background:var(--card);border:2px solid var(--accent);border-radius:14px;padding:18px;margin:20px 0}\n#result .big{font-size:2rem;font-weight:800;color:var(--accent)}\n#result table{width:100%;border-collapse:collapse;margin-top:10px}\n#result td,#result th{border-bottom:1px solid var(--line);padding:6px;text-align:left}\n.passage{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:12px;padding:16px 18px;margin:16px 0 8px}\n.passage h2{margin:0 0 8px;border:none;padding:0}\n.passage .ptext{font-family:Georgia,\"Times New Roman\",serif;font-size:1.05rem;line-height:1.9;margin:0}\n.passage sup{color:var(--accent);font-weight:700;font-family:system-ui,sans-serif;font-size:.7rem;margin-right:2px}\n.hide-ok .passage{display:none}\n.hide-ok .q.ok{display:none}\n.q.wait{border-color:var(--accent);border-style:dashed}\n.fb b.wait{color:var(--accent)}\n.muted{color:var(--muted);font-size:.9rem}\n.tscore{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.tscore label{border:1px solid var(--line);border-radius:6px;padding:2px 10px;cursor:pointer}\n.tscore input[type=radio]{display:none}\n.tscore label:has(input:checked){border-color:var(--accent);background:var(--accent-soft);font-weight:700}\n.tscore input[type=number]{width:80px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--ink);font:inherit}\n@media print{.tscore label:not(:has(input:checked)){display:none}}\n@media print{.bar{display:none}}" + '</style>');
if (!document.querySelector('meta[name=viewport]')) document.head.insertAdjacentHTML('beforeend', '<meta name="viewport" content="width=device-width, initial-scale=1">');
document.body.insertAdjacentHTML('afterbegin', "<div class=\"wrap\">\n  <header>\n    <h1 id=\"ttl\"></h1>\n    <p id=\"sub\"></p>\n  </header>\n  <div class=\"who\">\n    <input type=\"text\" id=\"sname\" placeholder=\"이름\">\n    <input type=\"text\" id=\"sclass\" placeholder=\"반 / 번호\">\n  </div>\n  <div id=\"result\"></div>\n  <section id=\"passage\" class=\"passage\"></section>\n  <div id=\"quiz\"></div>\n</div>\n<div class=\"bar\">\n  <button id=\"grade\">채점하기</button>\n  <button class=\"ghost\" id=\"toggle\" style=\"display:none\">오답만 보기</button>\n  <button class=\"ghost\" id=\"reset\">다시 풀기</button>\n</div>\n");
const PARTS = {A:"Part A. 내용 이해",B:"Part B. 어휘",C:"Part C. 구문·어법",D:"Part D. 연결어",E:"Part E. 서술형"};

const norm = s => (s||"").toLowerCase().replace(/[^a-z0-9가-힣]/g,"");
const normSent = s => (s||"").toLowerCase().replace(/[^a-z ]/g," ").replace(/\s+/g," ").trim();
const circ = ["①","②","③","④","⑤"];
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function render(){
  const root = document.getElementById("quiz"); let html="", cur="";
  for(const q of Q){
    if(q.p!==cur){cur=q.p; html+=`<h2>${PARTS[cur]}</h2>`;}
    html+=`<div class="q" id="q${q.n}"><div class="stem"><span class="num">${q.n}.</span>${esc(q.s)}</div>`;
    if(q.c) html+=`<div class="ctx">${q.t==="sent"?q.c:esc(q.c)}</div>`;
    if(q.t==="mc") html+=`<div class="opts">`+q.o.map((o,i)=>`<label><input type="radio" name="a${q.n}" value="${i+1}"><span>${circ[i]} ${esc(o)}</span></label>`).join("")+`</div>`;
    if(q.t==="choice") html+=`<div class="opts">`+q.o.map(o=>`<label><input type="radio" name="a${q.n}" value="${o}"><span>${o}</span></label>`).join("")+`</div>`;
    if(q.t==="tf") html+=q.items.map((it,i)=>`<div class="tfrow"><span>(${"abcdefgh"[i]}) ${esc(it[0])}</span><span class="tfbtns">
      <label><input type="radio" name="a${q.n}_${i}" value="T"><span>T</span></label>
      <label><input type="radio" name="a${q.n}_${i}" value="F"><span>F</span></label></span></div>`).join("");
    if(q.t==="short") html+=`<input type="text" id="a${q.n}" placeholder="답 입력">`;
    if(q.t==="sent"||q.t==="kw") html+=`<textarea id="a${q.n}" placeholder="답 입력"></textarea>`;
    if(q.t==="blanks") html+=q.blanks.map((b,i)=>`<div class="blank"><span>${b[0]}</span><input type="text" id="a${q.n}_${i}"></div>`).join("");
    if(q.t==="fix") html+=`<table class="fix"><tr><th>번호</th><th>틀린 부분</th><th>고친 것</th></tr>`+
      q.keys.map((_,i)=>`<tr><td>(${i+1})</td><td><input type="text" id="w${q.n}_${i}"></td><td><input type="text" id="a${q.n}_${i}"></td></tr>`).join("")+`</table>`;
    html+=`<div class="fb" id="fb${q.n}"></div></div>`;
  }
  root.innerHTML=html;
}

function val(name){const el=document.querySelector(`input[name="${name}"]:checked`);return el?el.value:"";}

function gradeQ(q){
  let score=0, mine="", right="";
  if(q.t==="mc"){const v=val("a"+q.n); score=+v===q.a?1:0; mine=v?circ[v-1]:"(무응답)"; right=circ[q.a-1];}
  else if(q.t==="choice"){const v=val("a"+q.n); score=v===q.a?1:0; mine=v||"(무응답)"; right=q.a;}
  else if(q.t==="tf"){let c=0, m=[]; q.items.forEach((it,i)=>{const v=val(`a${q.n}_${i}`); if(v===it[1])c++; m.push(`(${"abcdefgh"[i]}) ${v||"-"}`);});
    score=c/q.items.length; mine=m.join(" "); right=q.items.map((it,i)=>`(${"abcdefgh"[i]}) ${it[1]}`).join(" ");}
  else if(q.t==="short"){const v=document.getElementById("a"+q.n).value; score=q.ans.includes(norm(v))?1:0; mine=v||"(무응답)"; right=q.show;}
  else if(q.t==="sent"){const v=document.getElementById("a"+q.n).value; score=q.ans.includes(normSent(v))?1:0; mine=v||"(무응답)"; right=q.show;}
  else if(q.t==="kw"){const v=document.getElementById("a"+q.n).value; score=q.groups.every(g=>g.some(k=>v.includes(k)))?1:0; mine=v||"(무응답)"; right=q.show;}
  else if(q.t==="blanks"){let c=0,m=[]; q.blanks.forEach((b,i)=>{const v=document.getElementById(`a${q.n}_${i}`).value; if(b[1].includes(norm(v)))c++; m.push(`${b[0]} ${v||"-"}`);});
    score=c/q.blanks.length; mine=m.join(" "); right=q.show;}
  else if(q.t==="fix"){const got=new Set(); const m=[];
    for(let i=0;i<q.keys.length;i++){const v=document.getElementById(`a${q.n}_${i}`).value; const w=document.getElementById(`w${q.n}_${i}`).value;
      const nv=norm(v); const hit=q.keys.find(k=>nv.includes(k.k)); if(hit)got.add(hit.k); if(v||w)m.push(`${w||"?"} → ${v||"?"}`);}
    score=got.size/q.keys.length; mine=m.join(", ")||"(무응답)"; right=q.keys.map(k=>k.show).join(", ");}
  return {score,mine,right};
}

const MANUAL = new Set(["short","sent","kw","blanks","fix"]);
let autoScores = {}, teacher = {};
const r2 = x => Math.round(x*100)/100;

function setBox(n, score){
  const box=document.getElementById("q"+n);
  box.classList.remove("ok","bad","part","wait");
  box.classList.add("graded", score==null?"wait":score===1?"ok":score===0?"bad":"part");
}

function grade(){
  autoScores={}; teacher={};
  for(const q of Q){
    const r=gradeQ(q);
    if(MANUAL.has(q.t)){
      setBox(q.n,null);
      document.getElementById("fb"+q.n).innerHTML=
        `<b class="wait">교사 채점</b><br>학생 답: ${esc(r.mine)}<br>모범 답안: ${esc(r.right)}<br>근거: ${esc(q.e)}
         <div class="tscore">점수:
           <label><input type="radio" name="t${q.n}" value="1"><span>정답 1</span></label>
           <label><input type="radio" name="t${q.n}" value="0.5"><span>부분 0.5</span></label>
           <label><input type="radio" name="t${q.n}" value="0"><span>오답 0</span></label>
           <input type="number" min="0" max="1" step="0.1" placeholder="직접" id="tn${q.n}">
         </div>`;
      document.querySelectorAll(`input[name="t${q.n}"]`).forEach(el=>el.onchange=()=>{
        document.getElementById("tn"+q.n).value=""; teacher[q.n]=+el.value; setBox(q.n,teacher[q.n]); summary();});
      document.getElementById("tn"+q.n).oninput=e=>{
        const v=e.target.value; document.querySelectorAll(`input[name="t${q.n}"]`).forEach(x=>x.checked=false);
        if(v===""){delete teacher[q.n]; setBox(q.n,null);}
        else{teacher[q.n]=Math.max(0,Math.min(1,+v)); setBox(q.n,teacher[q.n]);}
        summary();};
    } else {
      autoScores[q.n]=r.score; setBox(q.n,r.score);
      const tag=r.score===1?'<b class="ok">정답</b>':r.score===0?'<b class="bad">오답</b>':`<b class="part">부분 정답 (${r2(r.score)}점)</b>`;
      document.getElementById("fb"+q.n).innerHTML=`${tag}<br>내 답: ${esc(r.mine)}<br>정답: ${esc(r.right)}<br>근거: ${esc(q.e)}`;
    }
  }
  summary();
  document.getElementById("result").style.display="block";
  document.getElementById("toggle").style.display="inline-block";
  document.getElementById("result").scrollIntoView({behavior:"smooth"});
}

function summary(){
  const tally={}; let auto=0, man=0; const wrong=[], pending=[];
  for(const q of Q){
    tally[q.p]=tally[q.p]||{s:0,n:0,w:0}; tally[q.p].n++;
    let s;
    if(MANUAL.has(q.t)){ if(q.n in teacher){s=teacher[q.n]; man+=s;} else {pending.push(q.n); tally[q.p].w++;} }
    else { s=autoScores[q.n]; auto+=s; }
    if(s!=null){ tally[q.p].s+=s; if(s<1) wrong.push(q.n); }
  }
  const total=auto+man, name=document.getElementById("sname").value, cls=document.getElementById("sclass").value;
  const rows=Object.keys(PARTS).filter(k=>tally[k]).map(k=>`<tr><td>${PARTS[k]}</td><td>${r2(tally[k].s)} / ${tally[k].n}${tally[k].w?` <span class="muted">(채점 대기 ${tally[k].w})</span>`:""}</td></tr>`).join("");
  document.getElementById("result").innerHTML=`<div>${esc(name||"")} ${esc(cls||"")}</div>
    <div class="big">${r2(total)} / ${Q.length}점 (${Math.round(total/Q.length*100)}%)</div>
    <div class="muted">자동 채점 ${r2(auto)}점 + 교사 채점 ${r2(man)}점${pending.length?` · 채점 대기: ${pending.join(", ")}번`:" · 채점 완료"}</div>
    <table><tr><th>영역</th><th>점수</th></tr>${rows}</table>
    <p>${wrong.length?`다시 볼 문항: ${wrong.join(", ")}`:(pending.length?"":"모든 문항을 맞혔습니다.")}</p>`;
}

document.getElementById("grade").onclick=grade;
document.getElementById("toggle").onclick=e=>{
  const on=document.body.classList.toggle("hide-ok"); e.target.textContent=on?"전체 보기":"오답만 보기";};
document.getElementById("reset").onclick=()=>{
  if(!confirm("입력한 답을 모두 지울까요?"))return;
  render(); document.getElementById("result").style.display="none";
  document.getElementById("toggle").style.display="none"; document.body.classList.remove("hide-ok");
  window.scrollTo({top:0});
};
function header(){
  const man=Q.filter(q=>MANUAL.has(q.t)).map(q=>q.n);
  document.title=META.title;
  document.getElementById("ttl").textContent=META.title;
  document.getElementById("sub").textContent=`${META.section} · ${Q.length}문항 · 문항당 1점 · 객관식·T/F는 자동 채점`+(man.length?`, 주관식(${man.join(", ")}번)은 교사 채점`:"");
}
function renderPassage(){
  const box=document.getElementById("passage");
  if(!META.passage||!META.passage.length){box.style.display="none";return;}
  box.innerHTML=`<h2>본문</h2><p class="ptext">`+META.passage.map(([n,t])=>`<sup>#${n}</sup>${esc(t)}`).join(" ")+`</p>`;
}
header();
renderPassage();
render();
