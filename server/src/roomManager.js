import { clearRoomTimers } from './gameLogic.js';

const rooms = new Map();

export function getRoom(codeValue) {
  return rooms.get(String(codeValue || '').toUpperCase());
}

export function createRoom(code, hostPlayer, settings, wordBank = []) {
  const room = {
    code: code.toUpperCase(),
    hostId: hostPlayer.id,
    players: [hostPlayer],
    phase: 'lobby',
    round: 1,
    settings: { ...settings },
    roles: {},
    words: {},
    wordBank,
    wordIndex: 0,
    readyPlayerIds: [],
    clues: [],
    votes: {},
    clueOrder: [],
    clueIndex: 0,
    result: null,
    eliminatedPlayerId: null,
    lastMessage: null,
    turnExpiresAt: null,
    timer: null,
    lastActivity: Date.now()
  };

  rooms.set(room.code, room);
  return room;
}

export function deleteRoom(code) {
  const upper = String(code || '').toUpperCase();
  const room = rooms.get(upper);
  if (room) {
    clearRoomTimers(room);
    rooms.delete(upper);
  }
}

export function touchRoom(room) {
  if (room) room.lastActivity = Date.now();
}

export function getActiveRoomCount() {
  return rooms.size;
}

// Garbage collection every 10 minutes: clean up rooms inactive for > 45 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > 25 * 60 * 1000) {
      console.log(`[RoomManager] Cleaning up inactive room ${code}`);
      clearRoomTimers(room);
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000);
