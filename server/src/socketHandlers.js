import { code, safeName, publicState, privateInfo } from './utils.js';
import {
  getRoom,
  createRoom,
  touchRoom,
  deleteRoom
} from './roomManager.js';
import {
  assignRoles,
  startClues,
  scheduleClueTurn,
  startDiscussion,
  openVoting,
  resolveVotes,
  checkWinner,
  finish,
  sendState,
  playerIn,
  active,
  proceedToNextRound
} from './gameLogic.js';
import { generateWordPairs } from './wordService.js';
import { DEFAULT_SETTINGS, ROLES, getMaxSpecialRoles } from './constants.js';

function replyError(ack, message) {
  if (typeof ack === 'function') ack({ error: message });
}

function sendJoined(socket, room, playerId) {
  socket.emit('room:joined', {
    roomCode: room.code,
    state: publicState(room),
    privateInfo: privateInfo(room, playerId)
  });
}

export function registerSocketHandlers(io, socket) {
  const action = (event, handler) => {
    socket.on(event, async (payload = {}, ack) => {
      try {
        await handler(payload, ack);
      } catch (err) {
        console.error(`Socket event [${event}] error:`, err);
        replyError(ack, 'Something went wrong. Please try again.');
      }
    });
  };

  // 1. Create Room
  action('room:create', async ({ playerId, name, settings }, ack) => {
    if (!playerId) return replyError(ack, 'Missing player identity.');

    let roomCode = code();
    while (getRoom(roomCode)) roomCode = code();

    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
    const player = {
      id: String(playerId),
      name: safeName(name),
      eliminated: false,
      passCode: Math.floor(Math.random() * 20) + 1
    };

    const wordBank = await generateWordPairs(mergedSettings.category, 20);
    const room = createRoom(roomCode, player, mergedSettings, wordBank);

    socket.join(roomCode);
    socket.data.playerId = player.id;
    socket.data.roomCode = roomCode;

    sendJoined(socket, room, player.id);
    if (typeof ack === 'function') ack({ ok: true, roomCode });
  });

  // 2. Join Room
  action('room:join', ({ playerId, name, code: inputCode }, ack) => {
    const room = getRoom(inputCode);
    if (!room) return replyError(ack, 'Room not found. Check the code.');
    if (room.phase !== 'lobby') return replyError(ack, 'Game has already started in this room.');

    const targetCount = room.settings.playerCount;
    if (room.players.length >= targetCount) {
      return replyError(ack, `Room is full for this session (${targetCount} players).`);
    }

    if (room.players.some(p => p.id === String(playerId))) {
      // Re-joining existing player slot
      socket.join(room.code);
      socket.data.playerId = playerId;
      socket.data.roomCode = room.code;
      sendJoined(socket, room, playerId);
      return typeof ack === 'function' && ack({ ok: true });
    }

    const player = {
      id: String(playerId),
      name: safeName(name),
      eliminated: false,
      passCode: Math.floor(Math.random() * 20) + 1
    };

    room.players.push(player);
    touchRoom(room);

    socket.join(room.code);
    socket.data.playerId = player.id;
    socket.data.roomCode = room.code;

    sendJoined(socket, room, player.id);
    socket.to(room.code).emit('game:update', { state: publicState(room) });
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 3. Update Settings (Lobby only, Host only)
  action('room:update_settings', async ({ playerId, roomCode, settings }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== playerId) return replyError(ack, 'Only the host can adjust settings.');
    if (room.phase !== 'lobby') return replyError(ack, 'Settings can only be changed in lobby.');

    if (settings.category && settings.category !== room.settings.category) {
      room.wordBank = await generateWordPairs(settings.category, 20);
      room.wordIndex = 0;
    }

    // Validate role balance constraints
    const newPlayerCount = settings.playerCount || room.settings.playerCount;
    const maxSpecial = getMaxSpecialRoles(newPlayerCount);

    let uc = settings.undercovers !== undefined ? settings.undercovers : room.settings.undercovers;
    let str = settings.strangers !== undefined ? settings.strangers : room.settings.strangers;

    if (uc + str > maxSpecial) {
      if (uc > maxSpecial) uc = maxSpecial;
      str = Math.max(0, maxSpecial - uc);
    }

    room.settings = {
      ...room.settings,
      ...settings,
      playerCount: newPlayerCount,
      undercovers: uc,
      strangers: str
    };

    touchRoom(room);
    sendState(room, io);
    if (typeof ack === 'function') ack({ ok: true, settings: room.settings });
  });

  // 4. Start Game
  action('game:start', ({ playerId, roomCode }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== playerId) return replyError(ack, 'Only the host can start the game.');
    if (room.phase !== 'lobby') return replyError(ack, 'The game has already started.');

    if (room.players.length !== room.settings.playerCount) {
      return replyError(
        ack,
        `Waiting for all players to join (${room.players.length}/${room.settings.playerCount}).`
      );
    }

    assignRoles(room);
    touchRoom(room);
    sendState(room, io);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 5. Memorized Role / Ready
  action('role:ready', ({ playerId, roomCode }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'role' || !playerIn(room, playerId)) {
      return replyError(ack, 'You cannot do that right now.');
    }

    if (!room.readyPlayerIds.includes(playerId)) {
      room.readyPlayerIds.push(playerId);
    }

    if (room.readyPlayerIds.length === room.players.length) {
      startClues(room, io);
    } else {
      sendState(room, io);
    }

    touchRoom(room);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 6. Submit Clue (Spotlight Turn)
  action('clue:submit', ({ playerId, roomCode, clue }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'clue') return replyError(ack, 'Clues are not being accepted now.');

    const currentId = room.clueOrder[room.clueIndex];
    if (currentId !== playerId) return replyError(ack, 'Wait for your turn.');

    const text = String(clue || '').trim().slice(0, 70);
    if (!text) return replyError(ack, 'Enter a clue first.');

    const player = playerIn(room, playerId);
    room.clues.push({ playerId, name: player?.name || 'Player', text });
    room.clueIndex += 1;

    touchRoom(room);

    if (room.clueIndex >= room.clueOrder.length) {
      startDiscussion(room, io);
    } else {
      scheduleClueTurn(room, io);
    }

    sendState(room, io);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 7. Open Voting (Host trigger or auto)
  action('vote:open', ({ playerId, roomCode }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'discussion') return replyError(ack, 'Voting cannot be opened now.');
    if (room.hostId !== playerId) return replyError(ack, 'Only the host can manually open voting early.');

    openVoting(room, io);
    touchRoom(room);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 8. Cast Vote
  action('vote:cast', ({ playerId, roomCode, targetId }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== 'vote') return replyError(ack, 'Voting is not currently open.');

    if (!active(room).some(p => p.id === playerId)) {
      return replyError(ack, 'Eliminated players cannot vote.');
    }
    if (room.votes[playerId]) return replyError(ack, 'You have already voted.');
    if (targetId === playerId || !active(room).some(p => p.id === targetId)) {
      return replyError(ack, 'Choose an eligible player to eliminate.');
    }

    room.votes[playerId] = targetId;
    touchRoom(room);

    if (active(room).every(p => room.votes[p.id])) {
      resolveVotes(room, io);
    }

    sendState(room, io);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 9. Stranger Last Chance Guess
  action('stranger:guess', ({ playerId, roomCode, guess }, ack) => {
    const room = getRoom(roomCode);
    if (
      !room ||
      room.phase !== 'stranger_guess' ||
      room.eliminatedPlayerId !== playerId ||
      room.roles[playerId] !== ROLES.STRANGER
    ) {
      return replyError(ack, 'You cannot make a guess right now.');
    }

    const correct =
      String(guess || '').trim().toLowerCase() === room.words.innocent.toLowerCase();

    touchRoom(room);

    if (correct) {
      finish(room, 'stranger', 'Stranger correctly guessed the Innocents’ word and stole the win!', io);
    } else {
      if (!checkWinner(room, io)) {
        proceedToNextRound(room, io);
      }
    }

    sendState(room, io);
    if (typeof ack === 'function') ack({ ok: true });
  });

  // 10. Restart Rematch
  action('game:restart', ({ playerId, roomCode }, ack) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== playerId || room.phase !== 'result') {
      return replyError(ack, 'Only the host can restart after a finished game.');
    }

    assignRoles(room);
    touchRoom(room);
    sendState(room, io);
    if (typeof ack === 'function') ack({ ok: true });
  });
}
