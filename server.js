// Quiz Clash - server. Node.js + WebSocket. In-memory rooms, no database.
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const QUESTIONS_PER_GAME = 10;
const QUESTION_SECONDS = Number(process.env.QUESTION_SECONDS) || 15;
const REVEAL_SECONDS = Number(process.env.REVEAL_SECONDS) || 4;
const MAX_PLAYERS = 8;

// ---------- Question bank (general knowledge, varied difficulty) ----------
const QUESTIONS = [
  { q: "What is the capital of Japan?", a: ["Kyoto", "Osaka", "Tokyo", "Seoul"], c: 2 },
  { q: "How many continents are there on Earth?", a: ["5", "6", "7", "8"], c: 2 },
  { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Mercury"], c: 1 },
  { q: "What is 12 x 8?", a: ["94", "96", "98", "108"], c: 1 },
  { q: "Which ocean is the largest?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], c: 3 },
  { q: "What year did humans first land on the Moon?", a: ["1965", "1969", "1972", "1959"], c: 1 },
  { q: "Which gas do plants absorb from the atmosphere?", a: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], c: 2 },
  { q: "How many sides does a hexagon have?", a: ["5", "6", "7", "8"], c: 1 },
  { q: "What is the largest mammal in the world?", a: ["African elephant", "Blue whale", "Giraffe", "Polar bear"], c: 1 },
  { q: "Which country has the largest population?", a: ["USA", "Indonesia", "China", "India"], c: 3 },
  { q: "What is H2O commonly known as?", a: ["Salt", "Water", "Oxygen", "Sugar"], c: 1 },
  { q: "Which instrument has 88 keys?", a: ["Guitar", "Violin", "Piano", "Drums"], c: 2 },
  { q: "How many minutes are in a full day?", a: ["1240", "1440", "1640", "1840"], c: 1 },
  { q: "Which country invented paper?", a: ["Egypt", "Greece", "China", "India"], c: 2 },
  { q: "What is the currency of the United Kingdom?", a: ["Euro", "Dollar", "Pound", "Franc"], c: 2 },
  { q: "Which bird cannot fly?", a: ["Eagle", "Penguin", "Sparrow", "Hawk"], c: 1 },
  { q: "How many colors are in a rainbow?", a: ["6", "7", "8", "9"], c: 1 },
  { q: "What is the hardest natural substance on Earth?", a: ["Gold", "Iron", "Diamond", "Quartz"], c: 2 },
  { q: "Which language has the most native speakers?", a: ["English", "Spanish", "Hindi", "Mandarin"], c: 3 },
  { q: "What does 'www' stand for in a website address?", a: ["World Wide Web", "World Web Wide", "Web World Wide", "Wide World Web"], c: 0 },
  { q: "Which desert is the largest in the world?", a: ["Gobi", "Sahara", "Mojave", "Kalahari"], c: 1 },
  { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], c: 1 },
  { q: "What is the boiling point of water at sea level?", a: ["90C", "95C", "100C", "110C"], c: 2 },
  { q: "Which company created the iPhone?", a: ["Samsung", "Google", "Apple", "Nokia"], c: 2 },
  { q: "What is the smallest prime number?", a: ["0", "1", "2", "3"], c: 2 },
  { q: "Which continent is the Sahara Desert mostly in?", a: ["Asia", "Africa", "Australia", "S. America"], c: 1 },
  { q: "How many players are on a soccer team on the field?", a: ["9", "10", "11", "12"], c: 2 },
  { q: "What is the main ingredient in guacamole?", a: ["Tomato", "Avocado", "Pepper", "Onion"], c: 1 },
  { q: "Which element has the chemical symbol 'O'?", a: ["Gold", "Oxygen", "Silver", "Iron"], c: 1 },
  { q: "How many days are there in a leap year?", a: ["365", "366", "364", "367"], c: 1 },
  { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Perth"], c: 2 },
  { q: "Which sport uses a puck?", a: ["Basketball", "Tennis", "Ice hockey", "Golf"], c: 2 },
  { q: "What is 15% of 200?", a: ["25", "30", "35", "40"], c: 1 },
  { q: "Which animal is the fastest land animal?", a: ["Lion", "Cheetah", "Horse", "Greyhound"], c: 1 },
  { q: "How many strings does a standard guitar have?", a: ["4", "5", "6", "7"], c: 2 },
  { q: "What is the largest planet in our solar system?", a: ["Saturn", "Jupiter", "Neptune", "Earth"], c: 1 },
  { q: "Which month has 28 days in a non-leap year?", a: ["January", "February", "All of them", "December"], c: 2 },
  { q: "What do you call a baby frog?", a: ["Tadpole", "Froglet", "Polliwog", "Spawn"], c: 0 },
  { q: "Which country is home to the kangaroo?", a: ["New Zealand", "South Africa", "Australia", "Brazil"], c: 2 },
  { q: "How many hours are in a week?", a: ["148", "158", "168", "178"], c: 2 },
  { q: "What is the freezing point of water?", a: ["0C", "32C", "-10C", "100C"], c: 0 },
  { q: "Which fruit has its seeds on the outside?", a: ["Blueberry", "Strawberry", "Raspberry", "Cherry"], c: 1 },
  { q: "What is the tallest mountain in the world?", a: ["K2", "Kilimanjaro", "Everest", "Denali"], c: 2 },
  { q: "How many teeth does an adult human typically have?", a: ["28", "30", "32", "34"], c: 2 },
  { q: "Which direction does the sun rise?", a: ["North", "South", "East", "West"], c: 2 },
  { q: "What is the longest river in the world?", a: ["Amazon", "Nile", "Mississippi", "Yangtze"], c: 1 },
  { q: "Which metal is liquid at room temperature?", a: ["Iron", "Mercury", "Lead", "Aluminum"], c: 1 },
  { q: "How many zeros are in one million?", a: ["5", "6", "7", "8"], c: 1 },
  { q: "What is the national sport of Japan?", a: ["Karate", "Baseball", "Sumo", "Judo"], c: 2 },
  { q: "Which planet is closest to the Sun?", a: ["Venus", "Earth", "Mercury", "Mars"], c: 2 },
];

// ---------- Rooms ----------
const rooms = new Map();
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars

function newCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function pickQuestions() {
  const idx = [...QUESTIONS.keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, QUESTIONS_PER_GAME).map(i => QUESTIONS[i]);
}

function send(ws, type, data = {}) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, ...data }));
}

function broadcast(room, type, data = {}) {
  for (const p of room.players.values()) send(p.ws, type, data);
}

function roomState(room) {
  return {
    code: room.code,
    state: room.state,
    hostId: room.hostId,
    players: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, score: p.score, connected: p.connected, isHost: p.id === room.hostId,
    })),
  };
}

function clearTimer(room) { if (room.timer) { clearTimeout(room.timer); room.timer = null; } }

function startGame(room) {
  room.state = 'playing';
  room.questions = pickQuestions();
  room.qIndex = 0;
  for (const p of room.players.values()) { p.score = 0; p.answered = false; }
  nextQuestion(room);
}

function nextQuestion(room) {
  if (room.qIndex >= room.questions.length) return endGame(room);
  const q = room.questions[room.qIndex];
  room.state = 'question';
  room.qStart = Date.now();
  for (const p of room.players.values()) { p.answered = false; p.lastAnswer = null; p.lastCorrect = null; }
  broadcast(room, 'question', {
    room: roomState(room),
    qNum: room.qIndex + 1, qTotal: room.questions.length,
    text: q.q, answers: q.a, seconds: QUESTION_SECONDS,
  });
  clearTimer(room);
  room.timer = setTimeout(() => reveal(room), QUESTION_SECONDS * 1000);
}

function answer(room, player, choice) {
  if (room.state !== 'question' || player.answered) return;
  player.answered = true;
  const q = room.questions[room.qIndex];
  const correct = choice === q.c;
  player.lastAnswer = choice;
  player.lastCorrect = correct;
  if (correct) {
    const elapsed = (Date.now() - room.qStart) / 1000;
    player.score += Math.round(100 + 100 * Math.max(0, 1 - elapsed / QUESTION_SECONDS));
  }
  send(player.ws, 'answer_result', { correct });
  // everyone answered -> reveal early
  const allIn = [...room.players.values()].filter(p => p.connected).every(p => p.answered);
  if (allIn) { clearTimer(room); reveal(room); }
  else broadcast(room, 'players', { room: roomState(room) });
}

function reveal(room) {
  clearTimer(room);
  room.state = 'reveal';
  const q = room.questions[room.qIndex];
  broadcast(room, 'reveal', {
    room: roomState(room),
    correctIndex: q.c,
    results: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, score: p.score,
      answered: p.lastAnswer !== null, correct: p.lastCorrect === true,
    })),
  });
  room.timer = setTimeout(() => { room.qIndex++; nextQuestion(room); }, REVEAL_SECONDS * 1000);
}

function endGame(room) {
  clearTimer(room);
  room.state = 'finished';
  const ranked = [...room.players.values()].sort((a, b) => b.score - a.score);
  broadcast(room, 'finished', {
    room: roomState(room),
    ranked: ranked.map(p => ({ id: p.id, name: p.name, score: p.score, isHost: p.id === room.hostId })),
  });
}

function removePlayer(room, player) {
  room.players.delete(player.id);
  if (room.players.size === 0) { clearTimer(room); rooms.delete(room.code); return; }
  if (room.hostId === player.id) {
    room.hostId = [...room.players.values()][0].id;
    broadcast(room, 'host_changed', {});
  }
  if (room.state === 'lobby') broadcast(room, 'players', { room: roomState(room) });
  else broadcast(room, 'players', { room: roomState(room) });
}

// ---------- WebSocket ----------
const server = http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  const fp = path.join(__dirname, 'public', file);
  const ext = path.extname(fp);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
  fs.readFile(fp, (err, data) => {
    if (err || !types[ext]) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[ext] });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });
let nextId = 1;

wss.on('connection', (ws) => {
  const id = 'p' + (nextId++);
  let player = null;

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }

    if (m.type === 'create') {
      const name = String(m.name || '').trim().slice(0, 16) || 'Player';
      const code = newCode();
      const room = { code, players: new Map(), state: 'lobby', hostId: id, timer: null };
      rooms.set(code, room);
      player = { id, name, ws, room, score: 0, connected: true };
      room.players.set(id, player);
      send(ws, 'joined', { room: roomState(room), you: { id, name } });
    }

    else if (m.type === 'join') {
      const code = String(m.code || '').toUpperCase().trim();
      const name = String(m.name || '').trim().slice(0, 16) || 'Player';
      const room = rooms.get(code);
      if (!room) { send(ws, 'error', { message: 'Room not found. Check the code!' }); return; }
      if (room.state !== 'lobby') { send(ws, 'error', { message: 'Game already started.' }); return; }
      // reconnect: same name as a disconnected player
      const existing = [...room.players.values()].find(p => p.name.toLowerCase() === name.toLowerCase());
      if (existing && !existing.connected) {
        existing.ws = ws; existing.connected = true;
        player = existing; player.ws = ws;
        send(ws, 'joined', { room: roomState(room), you: { id: player.id, name: player.name }, rejoined: true });
        broadcast(room, 'players', { room: roomState(room) });
        return;
      }
      if (room.players.size >= MAX_PLAYERS) { send(ws, 'error', { message: 'Room is full (8 max).' }); return; }
      if ([...room.players.values()].some(p => p.name.toLowerCase() === name.toLowerCase())) {
        send(ws, 'error', { message: 'Name taken in this room.' }); return;
      }
      player = { id, name, ws, room, score: 0, connected: true };
      room.players.set(id, player);
      send(ws, 'joined', { room: roomState(room), you: { id, name } });
      broadcast(room, 'players', { room: roomState(room) });
    }

    else if (m.type === 'start' && player) {
      const room = player.room;
      if (player.id === room.hostId && room.state === 'lobby' && room.players.size >= 2) startGame(room);
    }

    else if (m.type === 'answer' && player) {
      answer(player.room, player, Number(m.choice));
    }
  });

  ws.on('close', () => {
    if (!player || !player.room) return;
    const room = player.room;
    player.connected = false;
    if (room.state === 'lobby') {
      removePlayer(room, player);
    } else {
      // in-game: keep seat for reconnect; if host left, migrate
      if (room.hostId === player.id) {
        const alive = [...room.players.values()].find(p => p.connected);
        if (alive) { room.hostId = alive.id; broadcast(room, 'host_changed', {}); }
      }
      broadcast(room, 'players', { room: roomState(room) });
    }
  });
});

server.listen(PORT, () => console.log(`Quiz Clash running on http://localhost:${PORT}`));
