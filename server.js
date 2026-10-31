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
const QUESTIONS = require('./public/questions').map(q => ({q:q.text,a:q.answers,c:q.correct}));

// ---------- Rooms ----------
const rooms = new Map();
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ'; // four letters, no ambiguous I/L/O

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
    endsAt: room.qStart + QUESTION_SECONDS * 1000, serverTime: Date.now(),
  });
  clearTimer(room);
  room.timer = setTimeout(() => reveal(room), QUESTION_SECONDS * 1000);
}

function answer(room, player, choice) {
  if (room.state !== 'question' || player.answered) return;
  if (!Number.isInteger(choice) || choice < 0 || choice > 3) return;
  if (Date.now() - room.qStart >= QUESTION_SECONDS * 1000) return;
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
  let file;
  try { file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  if (file === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' })); return;
  }
  if (file === '/' && process.env.DEFAULT_GAME === 'multiplayer') {
    res.writeHead(302, { Location: '/multiplayer/' }); res.end(); return;
  }
  if (file.endsWith('/')) file += 'index.html';
  const base = path.resolve(__dirname, 'public');
  const fp = path.resolve(base, '.' + file);
  if (!fp.startsWith(base + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(fp);
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain' };
  fs.readFile(fp, (err, data) => {
    if (err || !types[ext]) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[ext], 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server, maxPayload: 16 * 1024 });
let nextId = 1;

wss.on('connection', (ws) => {
  const id = 'p' + (nextId++);
  let player = null;
  ws.on('error', () => {}); // close handler cleans up failed connections

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (player && (m.type === 'create' || m.type === 'join')) return;

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
    if (![...room.players.values()].some(p => p.connected)) {
      clearTimer(room); rooms.delete(room.code); return;
    }
    if (room.state === 'lobby') {
      removePlayer(room, player);
    } else {
      // in-game: keep seat for reconnect; if host left, migrate
      if (room.hostId === player.id) {
        const alive = [...room.players.values()].find(p => p.connected);
        if (alive) { room.hostId = alive.id; broadcast(room, 'host_changed', {}); }
      }
      broadcast(room, 'players', { room: roomState(room) });
      if (room.state === 'question' && [...room.players.values()].filter(p => p.connected).every(p => p.answered)) {
        reveal(room);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Quiz Clash running on port ${server.address().port}`));
