(function(){
"use strict";

const CONFIG_URL = "pyq-exams.json";
const params = new URLSearchParams(location.search);
const fixedExam = document.querySelector("main[data-exam]")?.dataset.exam;
const examKey = fixedExam || params.get("exam") || "gujarat-judiciary";

let activeExam;
let attemptedIds = new Set();
let allQuestions = [];
let questionsById = new Map();
let sessionQuestions = [];
let queue = [];
let answers = {};
let current = 0;
let sessionSignature = "";

const $ = id => document.getElementById(id);
const els = {};

function cacheEls(){
  [
    "examEyebrow","examTitle","examDescription","bankCount","yearCount","sessionScope",
    "sessionSummary","backToExamPage","attemptLimitNotice","yearFilter","subjectFilter","orderFilter",
    "startFilteredSession","answeredCount","sessionCount","correctCount","wrongCount",
    "remainingCount","progressBar","resumeButton","restartButton","questionNavigator",
    "navigatorCaption","coverageText","yearBreakdown","loadingState","errorState","errorText",
    "practiceArea","currentPosition","totalPosition","yearBadge","subjectBadge","questionNumber",
    "sourceQuestion","questionText","qualityNotice","optionsList","feedbackBox","feedbackTitle",
    "correctAnswerLine","explanationText","referenceLine","previousButton","skipButton","nextButton",
    "completeBox","finalCorrect","finalTotal","finalCopy","reviewWrongButton","newRunButton"
  ].forEach(id => els[id] = $(id));
}

function escapeText(v){ return String(v == null ? "" : v); }

function storageKey(){
  return "lexacademy_pyq_" + examKey + "_" + sessionSignature;
}

function makeSignature(filters){
  return [
    filters.year || "all",
    filters.subject || "all",
    filters.order || "shuffle"
  ].join("__").replace(/[^a-zA-Z0-9_-]+/g,"-");
}

function shuffleArray(a){
  const arr = a.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function qid(q){
  return String(q.id || [q.year,q.sourceQuestion,q.question].join("-"));
}

function normalizeBank(raw){
  const qs = Array.isArray(raw.questions) ? raw.questions : [];
  return qs.map((q,index)=>({
    id: qid(q) || String(index+1),
    year: q.year || "Unknown",
    paper: q.paper || "Prelims",
    sourceQuestion: q.sourceQuestion ?? null,
    subject: q.subject || "General",
    question: escapeText(q.question),
    options: Array.isArray(q.options) ? q.options.map(escapeText) : [],
    correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : null,
    explanation: escapeText(q.explanation || ""),
    reference: escapeText(q.reference || ""),
    sourceUrl: escapeText(q.sourceUrl || ""),
    status: q.status || "ready",
    note: escapeText(q.note || "")
  }));
}

async function loadJson(url){
  const response = await fetch(url);
  if(!response.ok) throw new Error("Could not load " + url + " (" + response.status + ")");
  return response.json();
}

async function boot(){
  cacheEls();
  try{
    const config = await loadJson(CONFIG_URL);
    activeExam = (config.exams || []).find(x => x.id === examKey);
    if(!activeExam) throw new Error("Unknown exam: " + examKey);

    const bank = await loadJson(activeExam.bank);
    allQuestions = normalizeBank(bank);
    questionsById = new Map(allQuestions.map(question => [qid(question), question]));

    applyExamMeta(activeExam);
    if(activeExam.attemptLimit) refreshAttemptedIds();
    buildFilters();
    buildCoverage();
    wireEvents();

    const filters = readFilters();
    startSession(filters,true);
    els.loadingState.hidden = true;
    els.practiceArea.hidden = false;
  }catch(err){
    console.error(err);
    els.loadingState.hidden = true;
    els.errorState.hidden = false;
    els.errorText.textContent = err.message || "Unknown error.";
  }
}

function applyExamMeta(exam){
  if(!fixedExam){
    document.title = (exam.pageTitle || exam.name + " PYQ Practice") + " | Lex Academy";
    els.examEyebrow.textContent = exam.eyebrow || "PREVIOUS YEAR QUESTIONS";
    els.examTitle.textContent = exam.pageTitle || exam.name + " PYQ Practice";
    els.examDescription.textContent = exam.description || "Practice the question bank.";
    els.backToExamPage.href = exam.guideUrl || "./";
  }
  els.bankCount.textContent = allQuestions.length;

  const years = new Set(allQuestions.filter(q => /^\d{4}$/.test(q.year)).map(q => String(q.year)));
  els.yearCount.textContent = years.size;
}

function attemptStorageKey(){
  return "lexacademy_mcq_attempts_" + examKey;
}

function refreshAttemptedIds(){
  try{
    const saved = JSON.parse(localStorage.getItem(attemptStorageKey()) || "null");
    if(Array.isArray(saved)){
      saved.forEach(id => attemptedIds.add(id));
      return;
    }
    // Count answers saved by the previous engine across all filter combinations.
    const prefix = "lexacademy_pyq_" + examKey + "_";
    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      if(!key?.startsWith(prefix)) continue;
      try{
        const session = JSON.parse(localStorage.getItem(key));
        for(const [id, answer] of Object.entries(session?.answers || {})){
          if(questionsById.has(id) && Number.isInteger(answer?.selected)) attemptedIds.add(id);
        }
      }catch(e){}
    }
    localStorage.setItem(attemptStorageKey(), JSON.stringify([...attemptedIds]));
  }catch(e){}
}

function canContinue(targetId){
  if(!activeExam.attemptLimit) return true;
  refreshAttemptedIds();
  if(attemptedIds.size < activeExam.attemptLimit || attemptedIds.has(targetId)) return true;
  location.assign(activeExam.attemptLimitRedirect);
  return false;
}

function renderAttemptNotice(){
  const limit = activeExam.attemptLimit;
  if(!limit) return;
  els.attemptLimitNotice.hidden = false;
  els.attemptLimitNotice.textContent = attemptedIds.size >= limit
    ? activeExam.attemptLimitMessage
    : Math.max(0, limit - attemptedIds.size) + " of " + limit + " free questions remaining.";
}

function buildFilters(){
  const years=[...new Set(allQuestions.map(q=>String(q.year)))].sort((a,b)=>Number(b)-Number(a));
  years.forEach(y=>{
    const o=document.createElement("option");
    o.value=y; o.textContent=y; els.yearFilter.appendChild(o);
  });

  const subjects=[...new Set(allQuestions.map(q=>q.subject).filter(Boolean))].sort();
  subjects.forEach(s=>{
    const o=document.createElement("option");
    o.value=s; o.textContent=s; els.subjectFilter.appendChild(o);
  });
}

function buildCoverage(){
  const counts={};
  allQuestions.forEach(q=>{ counts[q.year]=(counts[q.year]||0)+1; });
  els.yearBreakdown.innerHTML="";
  Object.keys(counts).sort((a,b)=>Number(b)-Number(a)).forEach(y=>{
    const d=document.createElement("div");
    d.innerHTML="<span>"+y+"</span><strong>"+counts[y]+"</strong>";
    els.yearBreakdown.appendChild(d);
  });

  const reviewCount=allQuestions.filter(q=>q.status!=="ready").length;
  els.coverageText.textContent =
    "Bank contains " + allQuestions.length + " records. " +
    (reviewCount ? reviewCount + " source records are flagged for manual review because of incomplete/OCR-damaged source text." :
    "All records are marked ready.");
}

function readFilters(){
  return {
    year: els.yearFilter.value,
    subject: els.subjectFilter.value,
    order: els.orderFilter.value
  };
}

function filterQuestions(filters){
  return allQuestions.filter(q=>{
    if(filters.year!=="all" && String(q.year)!==filters.year) return false;
    if(filters.subject!=="all" && q.subject!==filters.subject) return false;
    return true;
  });
}

function startSession(filters,allowResume){
  sessionSignature=makeSignature(filters);
  sessionQuestions=filterQuestions(filters);

  if(!sessionQuestions.length){
    queue=[]; answers={}; current=0; render();
    return;
  }

  const desiredIds = sessionQuestions.map(q=>qid(q));
  const saved = allowResume ? loadSaved() : null;

  if(saved && sameMembers(saved.queue,desiredIds)){
    queue=saved.queue;
    answers=saved.answers || {};
    current=Math.min(saved.current || 0,queue.length-1);
  }else{
    queue = filters.order==="paper"
      ? sessionQuestions.slice().sort((a,b)=>(Number(b.year)-Number(a.year)) || (Number(a.sourceQuestion||9999)-Number(b.sourceQuestion||9999))).map(q=>qid(q))
      : shuffleArray(desiredIds);
    answers={};
    current=0;
    saveState();
  }

  updateSessionCopy(filters);
  render();
}

function sameMembers(a,b){
  if(!Array.isArray(a) || a.length!==b.length) return false;
  const s=new Set(a);
  return b.every(x=>s.has(x));
}

function saveState(){
  try{
    localStorage.setItem(storageKey(),JSON.stringify({
      queue,answers,current,updatedAt:new Date().toISOString()
    }));
  }catch(e){}
}

function loadSaved(){
  try{
    const x=JSON.parse(localStorage.getItem(storageKey())||"null");
    return x && Array.isArray(x.queue) ? x : null;
  }catch(e){ return null; }
}

function updateSessionCopy(filters){
  const scope=[];
  if(filters.year!=="all") scope.push(filters.year);
  if(filters.subject!=="all") scope.push(filters.subject);
  els.sessionScope.textContent = scope.length ? scope.join(" · ") : "Full Question Bank";
  els.sessionSummary.textContent = queue.length + " unique questions in this run. " +
    (filters.order==="shuffle" ? "Shuffled once; no repeats." : "Presented in paper order.");
}

function getQuestionById(id){
  return questionsById.get(id);
}

function currentQuestion(){
  return queue.length ? getQuestionById(queue[current]) : null;
}

function getStats(){
  let correct=0,wrong=0,answered=0;
  queue.forEach(id=>{
    const a=answers[id];
    const q=getQuestionById(id);
    if(a && Number.isInteger(a.selected)){
      answered++;
      if(q && a.selected===q.correctAnswer) correct++; else wrong++;
    }
  });
  return {answered,correct,wrong,remaining:Math.max(0,queue.length-answered)};
}

function render(){
  renderAttemptNotice();
  const q=currentQuestion();
  const stats=getStats();

  els.sessionCount.textContent=queue.length;
  els.answeredCount.textContent=stats.answered;
  els.correctCount.textContent=stats.correct;
  els.wrongCount.textContent=stats.wrong;
  els.remainingCount.textContent=stats.remaining;
  els.progressBar.style.width=queue.length ? ((stats.answered/queue.length)*100)+"%" : "0%";
  els.navigatorCaption.textContent=queue.length+" questions";

  renderNavigator();

  if(!q){
    els.questionText.textContent="No questions match this filter.";
    els.optionsList.innerHTML="";
    els.feedbackBox.hidden=true;
    return;
  }

  els.currentPosition.textContent=current+1;
  els.totalPosition.textContent=queue.length;
  els.questionNumber.textContent=current+1;
  els.yearBadge.textContent=q.year;
  els.subjectBadge.textContent=q.subject;
  els.sourceQuestion.textContent=q.sourceQuestion ? ("Source paper Q"+q.sourceQuestion) : "Question bank";
  els.questionText.textContent=q.question || "Question text requires review.";

  const qualityBad = q.status!=="ready" || q.options.length<2 || q.correctAnswer===null;
  els.qualityNotice.hidden=!qualityBad;
  if(qualityBad){
    els.qualityNotice.textContent=q.note || "This source record is incomplete or OCR-damaged and requires manual verification before live scoring.";
  }

  renderOptions(q);
  renderFeedback(q);

  els.previousButton.disabled=current===0;
  els.nextButton.textContent=current===queue.length-1 ? "Finish →" : "Next →";
  renderCompletion(stats);
  saveState();
}

function renderOptions(q){
  els.optionsList.innerHTML="";
  const stored=answers[qid(q)];
  if(!q.options.length){
    const p=document.createElement("div");
    p.className="lpq-quality-notice";
    p.textContent="No usable options are available in this source record yet.";
    els.optionsList.appendChild(p);
    return;
  }

  q.options.forEach((text,index)=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="lpq-option";
    const l=document.createElement("span");
    l.className="lpq-option-letter";
    l.textContent=String.fromCharCode(65+index);
    const t=document.createElement("span");
    t.textContent=text;
    b.append(l,t);

    if(stored && Number.isInteger(stored.selected)){
      b.disabled=true;
      if(q.correctAnswer!==null && index===q.correctAnswer) b.classList.add("correct");
      else if(index===stored.selected) b.classList.add("wrong");
      else b.classList.add("dimmed");
    }else if(q.correctAnswer!==null){
      b.addEventListener("click",()=>answer(index));
    }else{
      b.disabled=true;
    }
    els.optionsList.appendChild(b);
  });
}

function answer(index){
  const q=currentQuestion();
  if(!q || q.correctAnswer===null) return;
  if(!canContinue(qid(q))) return;
  if(activeExam.attemptLimit){
    attemptedIds.add(qid(q));
    try{localStorage.setItem(attemptStorageKey(), JSON.stringify([...attemptedIds]));}catch(e){}
  }
  answers[qid(q)]={selected:index,answeredAt:new Date().toISOString()};
  saveState();
  render();
}

function renderFeedback(q){
  const stored=answers[qid(q)];
  if(!stored || !Number.isInteger(stored.selected) || q.correctAnswer===null){
    els.feedbackBox.hidden=true;
    return;
  }

  const right=stored.selected===q.correctAnswer;
  els.feedbackBox.hidden=false;
  els.feedbackBox.classList.toggle("correct",right);
  els.feedbackBox.classList.toggle("wrong",!right);
  els.feedbackTitle.textContent=right ? "✓ Correct" : "✕ Incorrect";
  els.correctAnswerLine.textContent="Correct answer: "+String.fromCharCode(65+q.correctAnswer)+" - "+(q.options[q.correctAnswer]||"");
  els.explanationText.textContent=q.explanation || "A detailed Lex Academy explanation has not yet been added for this imported source question.";
  if(q.reference || q.sourceUrl){
    els.referenceLine.hidden=false;
    els.referenceLine.textContent=(q.reference ? "Reference: "+q.reference : "") + (q.sourceUrl ? (q.reference ? " · " : "")+"Source paper: "+q.sourceUrl : "");
  }else{
    els.referenceLine.hidden=true;
  }
}

function renderNavigator(){
  els.questionNavigator.innerHTML="";
  queue.forEach((id,index)=>{
    const q=getQuestionById(id);
    const a=answers[id];
    const b=document.createElement("button");
    b.type="button";
    b.className="lpq-nav-btn";
    b.textContent=index+1;
    if(index===current) b.classList.add("current");
    if(a && q && Number.isInteger(a.selected)){
      b.classList.add(a.selected===q.correctAnswer ? "correct" : "wrong");
    }
    b.addEventListener("click",()=>{
      if(canContinue(id)){current=index;render();scrollPractice();}
    });
    els.questionNavigator.appendChild(b);
  });
}

function renderCompletion(stats){
  const complete=queue.length>0 && stats.answered===queue.length;
  els.completeBox.hidden=!complete;
  if(!complete) return;
  els.finalCorrect.textContent=stats.correct;
  els.finalTotal.textContent=queue.length;
  const pct=Math.round((stats.correct/queue.length)*100);
  els.finalCopy.textContent=
    pct>=80 ? "Strong attempt. Review the explanations and reattempt after revision." :
    pct>=60 ? "Good base. Review incorrect questions and identify recurring weak subjects." :
    "Use your incorrect answers as a revision list, then begin a fresh full-bank run.";
}

function next(){
  if(!canContinue()) return;
  if(current<queue.length-1){ current++;render();scrollPractice();return; }
  const stats=getStats();
  if(stats.answered<queue.length){
    const idx=queue.findIndex(id=>!answers[id]);
    if(idx>=0){ current=idx;render();scrollPractice(); }
  }else{
    els.completeBox.scrollIntoView({behavior:"smooth",block:"center"});
  }
}

function previous(){ if(current>0){current--;render();scrollPractice();} }

function skip(){
  if(!canContinue()) return;
  if(current<queue.length-1){current++;render();scrollPractice();}
  else{
    const idx=queue.findIndex(id=>!answers[id]);
    if(idx>=0){current=idx;render();scrollPractice();}
  }
}

function scrollPractice(){
  const area=document.querySelector(".lpq-main");
  if(area) window.scrollTo({top:area.getBoundingClientRect().top+window.scrollY-90,behavior:"smooth"});
}

function restart(){
  if(!canContinue()) return;
  if(!confirm("Restart this practice session and clear its answers?")) return;
  answers={};current=0;
  const filters=readFilters();
  const ids=filterQuestions(filters).map(q=>qid(q));
  queue=filters.order==="paper" ? ids : shuffleArray(ids);
  saveState();render();
}

function reviewWrong(){
  const idx=queue.findIndex(id=>{
    const q=getQuestionById(id),a=answers[id];
    return q && a && a.selected!==q.correctAnswer;
  });
  if(idx<0){ alert("No incorrect answers in this session."); return; }
  current=idx;render();scrollPractice();
}

function wireEvents(){
  els.startFilteredSession.addEventListener("click",()=>{
    if(canContinue()) startSession(readFilters(),true);
  });
  els.previousButton.addEventListener("click",previous);
  els.nextButton.addEventListener("click",next);
  els.skipButton.addEventListener("click",skip);
  els.restartButton.addEventListener("click",restart);
  els.resumeButton.addEventListener("click",()=>startSession(readFilters(),true));
  els.reviewWrongButton.addEventListener("click",reviewWrong);
  els.newRunButton.addEventListener("click",()=>{
    if(!canContinue()) return;
    els.yearFilter.value="all";
    els.subjectFilter.value="all";
    els.orderFilter.value="shuffle";
    startSession(readFilters(),false);
    scrollPractice();
  });
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
else boot();

})();
