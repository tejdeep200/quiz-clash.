(function(root) {
function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i=a.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function round(bank, category, difficulty, mode) {
  const pool = bank.filter(q => (mode==='clash' || category==='All categories' || q.category===category) && q.difficulty===difficulty);
  return shuffle(pool).slice(0, mode==='clash'?12:6).map(q=> {
    const order = shuffle([0,1,2,3]);
    return {...q, answers:order.map(i=>q.answers[i]),correct:order.indexOf(q.correct)};
  });
}
function duration(difficulty, mode, index) {
  const base = {Easy:20,Medium:15,Hard:12}[difficulty] || 15;
  return mode==='clash'? Math.max(6,base-Math.floor(index/3)*2):base;
}
function award(correct, streak, remaining, seconds, mode) {
  if (!correct || remaining<=0) return {points:0,streak:0,multiplier:1};
  const next=streak+1, multiplier=mode==='clash'?Math.min(4,1+Math.floor((next-1)/3)):1;
  return {points:(100+Math.round(100*Math.min(1,remaining/seconds)) + Math.min(100,(next-1)*20))*multiplier,streak:next,multiplier};
}
function rank(accuracy) {return accuracy===100?'CLASH LEGEND':accuracy>=80?'GRANDMASTER':accuracy>=60?'CHALLENGER':accuracy>=40?'RISING STAR':'ROOKIE';}
function saveScore(storage, entry) {
  try {
    const scores=readScores(storage); scores.push(entry);
    scores.sort((a,b)=>b.score-a.score); storage.setItem('quiz-clash-scores-v2',JSON.stringify(scores.slice(0,10))); return true;
  } catch {return false;}
}
function readScores(storage) {
  try { const value=JSON.parse(storage.getItem('quiz-clash-scores-v2')||'[]');
    return Array.isArray(value)?value.filter(x=>x && Number.isFinite(x.score) && x.score>=0 && typeof x.category==='string' && ['solo','clash'].includes(x.mode) && ['Easy','Medium','Hard'].includes(x.difficulty)).sort((a,b)=>b.score-a.score).slice(0,10):[];
  } catch { return []; }
}
const api={shuffle,round,duration,award,rank,saveScore,readScores};
if(typeof module!=='undefined') module.exports=api; else root.QuizEngine=api;
})(globalThis);
