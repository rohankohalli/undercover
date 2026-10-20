import { randomInt } from 'node:crypto';
import { ROLES } from './constants.js';

export function code() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars[randomInt(chars.length)];
  }
  return result;
}

export function safeName(name) {
  return String(name || 'Player').trim().replace(/[<>]/g, '').slice(0, 18) || 'Player';
}

export function publicState(room) {
  const currentCluePlayer = room.players.find(p => p.id === room.clueOrder[room.clueIndex]);

  return {
    roomCode: room.code,
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    maxRounds: room.settings.maxRounds,
    targetPlayerCount: room.settings.playerCount,
    settings: {
      playerCount: room.settings.playerCount,
      undercovers: room.settings.undercovers,
      strangers: room.settings.strangers,
      clueTimer: room.settings.clueTimer,
      roundTimer: room.settings.roundTimer,
      maxRounds: room.settings.maxRounds,
      category: room.settings.category
    },
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      eliminated: p.eliminated,
      passCode: p.passCode || null
    })),
    readyPlayerIds: [...room.readyPlayerIds],
    currentCluePlayerId: currentCluePlayer?.id || null,
    currentCluePlayerName: currentCluePlayer?.name || null,
    clues: room.clues,
    turnExpiresAt: room.turnExpiresAt || null,
    votedPlayerIds: Object.keys(room.votes),
    eliminatedPlayerId: room.eliminatedPlayerId,
    lastMessage: room.lastMessage || null,
    result: room.result ? { ...room.result } : null
  };
}

export function privateInfo(room, playerId) {
  const role = room.roles[playerId] || null;
  let word = null;
  if (role === ROLES.INNOCENT) {
    word = room.words.innocent;
  } else if (role === ROLES.UNDERCOVER) {
    word = room.words.undercover;
  } else if (role === ROLES.STRANGER) {
    word = null;
  }
  return { role, word };
}
