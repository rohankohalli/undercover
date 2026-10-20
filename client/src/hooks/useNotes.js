import { useState, useEffect, useCallback } from 'react';

export function useNotes(roomCode) {
  const storageKey = `undercover-notes-${roomCode || 'default'}`;

  const [notes, setNotes] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (roomCode) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(notes));
      } catch (err) {
        console.warn('Failed to save private notes to sessionStorage:', err);
      }
    }
  }, [notes, roomCode, storageKey]);

  const setNote = useCallback((targetPlayerId, tag) => {
    setNotes(prev => {
      const next = { ...prev };
      if (next[targetPlayerId] === tag) {
        // Toggle off if clicking same tag
        delete next[targetPlayerId];
      } else {
        next[targetPlayerId] = tag;
      }
      return next;
    });
  }, []);

  const getNote = useCallback(
    targetPlayerId => {
      return notes[targetPlayerId] || null;
    },
    [notes]
  );

  const clearNotes = useCallback(() => {
    setNotes({});
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return { notes, setNote, getNote, clearNotes };
}
