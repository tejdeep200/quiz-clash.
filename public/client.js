// Quiz Clash client
const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
let myId = null, myName = '', isHost = false, timerInt = null, lastAnswers = [];

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function err(msg) { document.getElementById('home-err').textContent = msg; }
function send(type, data = {}) { ws.send(JSON.stringify({ type, ...data })); }

function renderLobby(room) {
  document.getElementById('room-code').textContent = room.code;
  const ul = document.getElementById('lobby-players');
  ul.innerHTML = '';
  room.players.forEach(p => {
    const li = document.createElement('li');
    if (p.id === myId) li.className = 'me';
    li.innerHTML = `<span>${esc(p.name)}${p.isHost ? '<span class="host-tag">HOST</span>' : ''}${p.connected ? '' : ' <span class="off">(away)</span>'}</span><span class="pts">${p.score}</span>`;
    ul.appendChild(li);
  });
  const me = room.players.find(p => p.id === myId);
  isHost = me && me.isHost;
  const btn = document.getElementById('btn-start');
  const hint = document.getElementById('lobby-hint');
  if (isHost) {
    btn.classList.remove('hidden');
    btn.disabled = room.players.length < 2;
    btn.textContent = room.players.length < 2 ? 'Waiting for players...' : 'Start Game';
    hint.textContent = '';
  } else {
    btn.classList.add('hidden');
    hint.textContent = 'Waiting for the host to start the game...';
  }
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function renderBoard(ulId, list) {
  const ul = document.getElementById(ulId);
  ul.innerHTML = '';
  list.forEach((p, i) => {
    const li = document.createElement('li');
    if (i === 0) li.className = 'winner';
    if (p.id === myId) li.classList.add('me');
    li.innerHTML = `<span>${i + 1}. ${esc(p.name)}${p.id === myId ? ' (you)' : ''}</span><span class="pts">${p.score}</span>`;
    ul.appendChild(li);
  });
}

function startTimer(seconds) {
  clearInterval(timerInt);
  let left = seconds;
  const tick = () => {
    document.getElementById('q-timer').textContent = left + 's';
    document.getElementById('timer-fill').style.width = (left / seconds * 100) + '%';
    left--;
  };
  tick();
  timerInt = setInterval(() => { if (left < 0) clearInterval(timerInt); else tick(); }, 1000);
}

ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.type === 'joined') {
    myId = m.you.id; myName = m.you.name;
    renderLobby(m.room); show('scr-lobby');
  }
  else if (m.type === 'players') {
    if (document.getElementById('scr-lobby').classList.contains('active')) renderLobby(m.room);
  }
  else if (m.type === 'host_changed') { /* lobby re-renders on next players msg */ }
  else if (m.type === 'question') {
    show('scr-game');
    document.getElementById('q-num').textContent = `Question ${m.qNum} of ${m.qTotal}`;
    document.getElementById('q-text').textContent = m.text;
    document.getElementById('q-locked').classList.add('hidden');
    const box = document.getElementById('q-answers');
    box.innerHTML = '';
    lastAnswers = m.answers;
    m.answers.forEach((a, i) => {
      const b = document.createElement('button');
      b.className = 'ans'; b.textContent = a;
      b.onclick = () => {
        send('answer', { choice: i });
        box.querySelectorAll('.ans').forEach(x => { x.classList.add('locked'); x.onclick = null; });
        b.style.borderColor = '#7c5cff';
        document.getElementById('q-locked').classList.remove('hidden');
      };
      box.appendChild(b);
    });
    startTimer(m.seconds);
  }
  else if (m.type === 'answer_result') { /* silent; reveal shows it */ }
  else if (m.type === 'reveal') {
    clearInterval(timerInt);
    show('scr-reveal');
    document.getElementById('rev-title').textContent = 'Leaderboard';
    const box = document.getElementById('q-answers');
    const answers = m.results;
    // mark correct/wrong on the question screen is gone; just show board
    renderBoard('rev-board', [...m.room.players].sort((a, b) => b.score - a.score));
    const me = m.results.find(r => r.id === myId);
    if (me) document.getElementById('rev-title').textContent = me.correct ? 'Correct!' : (me.answered ? 'Wrong!' : 'Too slow!');
    document.getElementById('rev-answer').textContent = 'Correct answer: ' + (lastAnswers[m.correctIndex] || '');
  }
  else if (m.type === 'finished') {
    show('scr-end');
    const top = m.ranked[0];
    document.getElementById('winner').textContent = top.id === myId ? 'YOU WIN!' : `${top.name} wins!`;
    renderBoard('final-board', m.ranked);
  }
  else if (m.type === 'error') { err(m.message); }
};

document.getElementById('btn-create').onclick = () => {
  const name = document.getElementById('in-name').value.trim();
  if (!name) { err('Enter your name first.'); return; }
  err(''); send('create', { name });
};
document.getElementById('btn-join').onclick = () => {
  const name = document.getElementById('in-name').value.trim();
  const code = document.getElementById('in-code').value.trim();
  if (!name) { err('Enter your name first.'); return; }
  if (code.length !== 4) { err('Enter the 4-letter room code.'); return; }
  err(''); send('join', { name, code });
};
document.getElementById('btn-start').onclick = () => send('start', {});
document.getElementById('btn-again').onclick = () => location.reload();
