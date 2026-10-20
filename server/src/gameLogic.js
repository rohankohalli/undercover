import { ROLES } from './constants.js';
import { publicState, privateInfo } from './utils.js';

export function active(room) {
  return room.players.filter(p => !p.eliminated);
}

export function playerIn(room, id) {
  return room?.players.find(p => p.id === id);
}

export function sendState(room, io) {
  for (const p of room.players) {
    const s = [...io.sockets.sockets.values()].find(
      sock => sock.data.playerId === p.id && sock.data.roomCode === room.code
    );
    if (s) {
      s.emit('game:update', {
        state: publicState(room),
        privateInfo: privateInfo(room, p.id)
      });
    }
  }
}

export function clearRoomTimers(room) {
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
}

export function finish(room, winner, message, io) {
  clearRoomTimers(room);
  room.phase = 'result';
  room.turnExpiresAt = null;
  room.result = {
    winner,
    message,
    innocentWord: room.words.innocent,
    undercoverWord: room.words.undercover,
    roles: { ...room.roles }
  };
  if (io) sendState(room, io);
}

export function checkWinner(room, io) {
  const living = active(room);
  const undercoversAlive = living.filter(p => room.roles[p.id] === ROLES.UNDERCOVER).length;
  const strangersAlive = living.filter(p => room.roles[p.id] === ROLES.STRANGER).length;
  const innocentsAlive = living.filter(p => room.roles[p.id] === ROLES.INNOCENT).length;
  const totalInfiltrators = undercoversAlive + strangersAlive;

  // 1. All infiltrators eliminated -> Innocents win!
  if (totalInfiltrators === 0) {
    finish(room, 'innocent', 'All infiltrators have been eliminated. Innocents win!', io);
    return true;
  }

  // 2. Infiltrators equal or outnumber Innocents -> Infiltrators win!
  if (totalInfiltrators >= innocentsAlive) {
    finish(room, 'undercover', 'Infiltrators have outsmarted the group and survived!', io);
    return true;
  }

  return false;
}

export function assignRoles(room) {
  clearRoomTimers(room);
  const players = [...room.players].sort(() => Math.random() - 0.5);

  // Allot 1-20 pass code for Pass & Play / local privacy
  const usedCodes = new Set();
  room.players.forEach(p => {
    let num = Math.floor(Math.random() * 20) + 1;
    while (usedCodes.has(num)) {
      num = Math.floor(Math.random() * 20) + 1;
    }
    usedCodes.add(num);
    p.passCode = num;
    p.eliminated = false;
  });

  // Pick word pair
  if (!room.wordBank || room.wordBank.length === 0) {
    room.words = { innocent: 'Coffee', undercover: 'Tea' };
  } else {
    const pairIndex = room.wordIndex % room.wordBank.length;
    room.wordIndex = (room.wordIndex + 1) % room.wordBank.length;
    const pair = room.wordBank[pairIndex];
    room.words = { innocent: pair[0], undercover: pair[1] };
  }

  room.roles = {};
  const numUndercovers = Math.min(room.settings.undercovers, Math.floor(players.length / 2));
  const numStrangers = Math.min(room.settings.strangers, Math.floor((players.length - 1) / 2) - numUndercovers);

  let idx = 0;
  for (let i = 0; i < numUndercovers; i++) {
    if (players[idx]) room.roles[players[idx++].id] = ROLES.UNDERCOVER;
  }
  for (let i = 0; i < numStrangers; i++) {
    if (players[idx]) room.roles[players[idx++].id] = ROLES.STRANGER;
  }
  while (idx < players.length) {
    if (players[idx]) room.roles[players[idx++].id] = ROLES.INNOCENT;
  }

  room.round = 1;
  room.phase = 'role';
  room.readyPlayerIds = [];
  room.clues = [];
  room.votes = {};
  room.result = null;
  room.eliminatedPlayerId = null;
  room.clueOrder = [];
  room.clueIndex = 0;
  room.lastMessage = null;
  room.turnExpiresAt = null;
}

export function startClues(room, io) {
  clearRoomTimers(room);
  room.phase = 'clue';
  room.clueOrder = active(room).map(p => p.id);
  room.clueIndex = 0;
  room.votes = {};
  room.readyPlayerIds = [];

  scheduleClueTurn(room, io);
}

export function scheduleClueTurn(room, io) {
  clearRoomTimers(room);
  const currentId = room.clueOrder[room.clueIndex];
  if (!currentId) {
    startDiscussion(room, io);
    return;
  }

  const durationSec = room.settings.clueTimer || 45;
  room.turnExpiresAt = Date.now() + durationSec * 1000;
  if (io) sendState(room, io);

  room.timer = setTimeout(() => {
    // Clue timeout: auto-skip with default clue
    const player = playerIn(room, currentId);
    if (player && room.phase === 'clue' && room.clueOrder[room.clueIndex] === currentId) {
      room.clues.push({
        playerId: currentId,
        name: player.name,
        text: '...'
      });
      room.clueIndex += 1;
      if (room.clueIndex >= room.clueOrder.length) {
        startDiscussion(room, io);
      } else {
        scheduleClueTurn(room, io);
      }
      if (io) sendState(room, io);
    }
  }, durationSec * 1000);
}

export function startDiscussion(room, io) {
  clearRoomTimers(room);
  room.phase = 'discussion';
  const durationSec = room.settings.roundTimer || 60;
  room.turnExpiresAt = Date.now() + durationSec * 1000;
  if (io) sendState(room, io);

  // Auto-open voting after discussion timer
  room.timer = setTimeout(() => {
    if (room.phase === 'discussion') {
      openVoting(room, io);
    }
  }, durationSec * 1000);
}

export function openVoting(room, io) {
  clearRoomTimers(room);
  room.phase = 'vote';
  room.votes = {};
  const durationSec = room.settings.roundTimer || 60;
  room.turnExpiresAt = Date.now() + durationSec * 1000;
  if (io) sendState(room, io);

  // Auto-vote on timeout for AFK players
  room.timer = setTimeout(() => {
    if (room.phase === 'vote') {
      const living = active(room);
      for (const p of living) {
        if (!room.votes[p.id]) {
          const eligibleTargets = living.filter(t => t.id !== p.id);
          if (eligibleTargets.length > 0) {
            const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
            room.votes[p.id] = randomTarget.id;
          }
        }
      }
      resolveVotes(room, io);
      if (io) sendState(room, io);
    }
  }, durationSec * 1000);
}

export function resolveVotes(room, io) {
  clearRoomTimers(room);
  const counts = {};
  for (const targetId of Object.values(room.votes)) {
    counts[targetId] = (counts[targetId] || 0) + 1;
  }
  const max = Math.max(0, ...Object.values(counts));
  const leaders = Object.keys(counts).filter(id => counts[id] === max);

  if (leaders.length !== 1) {
    room.phase = 'discussion';
    room.result = null;
    room.lastMessage = 'The vote was tied! Discuss again and vote once more.';
    startDiscussion(room, io);
    return;
  }

  const eliminated = playerIn(room, leaders[0]);
  if (!eliminated) return;
  eliminated.eliminated = true;
  room.eliminatedPlayerId = eliminated.id;

  // Stranger gets a last-chance guess
  if (room.roles[eliminated.id] === ROLES.STRANGER) {
    room.phase = 'stranger_guess';
    const guessSec = 45;
    room.turnExpiresAt = Date.now() + guessSec * 1000;
    if (io) sendState(room, io);

    room.timer = setTimeout(() => {
      if (room.phase === 'stranger_guess') {
        // Timed out without guess
        if (checkWinner(room, io)) return;
        proceedToNextRound(room, io);
      }
    }, guessSec * 1000);
    return;
  }

  if (checkWinner(room, io)) return;
  proceedToNextRound(room, io);
}

export function proceedToNextRound(room, io) {
  // Check if max rounds reached
  if (room.round >= room.settings.maxRounds) {
    finish(room, 'undercover', `Max rounds (${room.settings.maxRounds}) reached! Undercover survived!`, io);
    return;
  }

  room.round += 1;
  room.lastMessage = null;
  startClues(room, io);
}
