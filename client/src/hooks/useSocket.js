import { useState, useEffect, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function getOrCreatePlayerId() {
  let id = sessionStorage.getItem('undercover-player-id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('undercover-player-id', id);
  }
  return id;
}

export function useSocket() {
  const playerId = useMemo(getOrCreatePlayerId, []);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [state, setState] = useState(null);
  const [privateInfo, setPrivateInfo] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const s = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      setError('');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('room:joined', ({ roomCode: code, state: nextState, privateInfo: priv }) => {
      setRoomCode(code);
      setState(nextState);
      if (priv) setPrivateInfo(priv);
      setError('');
    });

    s.on('game:update', ({ state: nextState, privateInfo: priv }) => {
      setState(nextState);
      if (priv) setPrivateInfo(priv);
      setError('');
    });

    s.on('connect_error', () => {
      setError('Cannot connect to game server. Verify backend is running.');
    });

    return () => s.disconnect();
  }, []);

  const act = useCallback(
    (event, payload = {}, callback) => {
      if (!socket) return;
      setError('');
      socket.emit(event, { ...payload, playerId, roomCode }, res => {
        if (res?.error) {
          setError(res.error);
        } else if (callback) {
          callback(res);
        }
      });
    },
    [socket, playerId, roomCode]
  );

  const resetRoom = useCallback(() => {
    setRoomCode('');
    setState(null);
    setPrivateInfo(null);
  }, []);

  return {
    playerId,
    socket,
    connected,
    roomCode,
    state,
    privateInfo,
    error,
    setError,
    notice,
    setNotice,
    act,
    resetRoom
  };
}
