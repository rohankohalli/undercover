import { useState, useEffect } from 'react';

export default function HomeScreen({
  connected,
  onCreateRoom,
  onJoinRoom,
  onStartPassAndPlay
}) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Check URL query parameters for ?join=ABCD (from QR code scan)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('join');
    if (codeFromUrl) {
      setJoinCode(codeFromUrl.toUpperCase().slice(0, 5));
    }
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim() || joinCode.trim().length < 4) return;
    onJoinRoom(name.trim(), joinCode.trim().toUpperCase());
  };

  return (
    <section className="hero">
      <div className="eyebrow">A SECRET WORD PARTY GAME</div>
      <h1>
        Trust nobody.<br />
        <em>Not even your friends.</em>
      </h1>
      <p className="sub">
        Everyone has a secret word. Infiltrators have a slightly different one,
        while the Stranger has nothing at all. Can you spot them?
      </p>

      <div className="panel" style={{ textAlign: 'left', marginTop: '24px' }}>
        <label
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '8px'
          }}
        >
          YOUR NICKNAME
        </label>
        <input
          value={name}
          maxLength={18}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Alex"
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />

        <div className="hero-actions">
          <button
            className="primary full"
            disabled={!name.trim() || !connected}
            onClick={handleCreate}
          >
            Create New Game Room <span>↗</span>
          </button>

          <div className="or-divider">
            <span /> OR JOIN WITH CODE <span />
          </div>

          <div className="join-row">
            <input
              value={joinCode}
              maxLength={5}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              className="secondary"
              disabled={!name.trim() || joinCode.trim().length < 4 || !connected}
              onClick={handleJoin}
            >
              Join
            </button>
          </div>

          <div className="or-divider">
            <span /> OR PLAY OFFLINE <span />
          </div>

          <button className="secondary full" onClick={onStartPassAndPlay}>
            📱 Pass & Play (Single Phone Mode)
          </button>
        </div>

        <p className="hint">
          Best with 3–10 players · Works on any phone or laptop browser
        </p>
      </div>
    </section>
  );
}
