const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../public/engine'),bank=require('../public/questions');
const categories=['Technology','Science','History','Geography','Sports','General Knowledge'];
test('108 unique questions, distinct choices, all 18 category/level combinations',()=>{
 assert.equal(bank.length,108);assert.equal(new Set(bank.map(q=>q.id)).size,108);assert.equal(new Set(bank.map(q=>q.text)).size,108);
 bank.forEach(q=>{assert.equal(q.answers.length,4);assert.equal(new Set(q.answers).size,4);assert.ok(q.correct>=0&&q.correct<4);});
 for(const c of categories)for(const d of ['Easy','Medium','Hard'])assert.equal(bank.filter(q=>q.category===c&&q.difficulty===d).length,6);
});
test('solo rounds honor category/difficulty, never repeat, preserve shuffled keys',()=>{
 for(let n=0;n<30;n++)for(const c of categories)for(const d of ['Easy','Medium','Hard']){const r=E.round(bank,c,d,'solo');assert.equal(r.length,6);assert.equal(new Set(r.map(q=>q.id)).size,6);r.forEach(q=>{assert.equal(q.category,c);assert.equal(q.difficulty,d);assert.equal(q.answers[q.correct],bank.find(x=>x.id===q.id).answers[0]);});}
});
test('Clash rounds contain 12 distinct mixed questions at chosen difficulty',()=>{
 for(const d of ['Easy','Medium','Hard']){const r=E.round(bank,'Technology',d,'clash');assert.equal(r.length,12);assert.equal(new Set(r.map(q=>q.id)).size,12);assert.ok(new Set(r.map(q=>q.category)).size>1);assert.ok(r.every(q=>q.difficulty===d));}
});
test('exact speed/streak scoring, multiplier thresholds, reset, expiry',()=>{
 assert.deepEqual(E.award(true,0,20,20,'solo'),{points:200,streak:1,multiplier:1});assert.equal(E.award(true,1,10,20,'solo').points,170);assert.equal(E.award(true,3,20,20,'clash').points,520);assert.equal(E.award(true,9,20,20,'clash').points,1200);assert.equal(E.award(true,30,25,20,'clash').points,1200);assert.deepEqual(E.award(false,9,15,20,'clash'),{points:0,streak:0,multiplier:1});assert.equal(E.award(true,9,0,20,'clash').points,0);assert.equal(E.award(true,9,-1,20,'clash').points,0);
});
test('clock intensifies every three questions; minimum six seconds',()=>{assert.deepEqual(Array.from({length:12},(_,i)=>E.duration('Hard','clash',i)),[12,12,12,10,10,10,8,8,8,6,6,6]);assert.equal(E.duration('Easy','solo',10),20);assert.equal(E.duration('Hard','clash',100),6);});
test('leaderboard persists, sorts, caps at ten, recovers from broken/blocked storage',()=>{
 const s={value:'[]',getItem(){return this.value},setItem(k,v){this.value=v}};
 for(let i=0;i<15;i++)assert.ok(E.saveScore(s,{score:i*100,category:'Science',difficulty:'Easy',mode:'solo'}));assert.equal(E.readScores(s).length,10);assert.equal(E.readScores(s)[0].score,1400);s.value='{bad';assert.deepEqual(E.readScores(s),[]);s.value='null';assert.deepEqual(E.readScores(s),[]);s.value='[{"score":-1},{"score":100,"category":"x","mode":"injected"}]';assert.deepEqual(E.readScores(s),[]);assert.deepEqual(E.readScores(null),[]);assert.equal(E.saveScore(null,{}),false);
});
test('accuracy ranks',()=>{assert.equal(E.rank(100),'CLASH LEGEND');assert.equal(E.rank(83),'GRANDMASTER');assert.equal(E.rank(67),'CHALLENGER');assert.equal(E.rank(50),'RISING STAR');assert.equal(E.rank(0),'ROOKIE');});
