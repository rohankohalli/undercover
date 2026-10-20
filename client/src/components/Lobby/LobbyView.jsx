import QRCodeCard from './QRCodeCard.jsx';
import ConfigSliders from './ConfigSliders.jsx';

export default function LobbyView({
  roomCode,
  state,
  playerId,
  onStartGame,
  onUpdateSettings,
  onNotice
}) {
  const isHost = state.hostId === playerId;
  const targetCount = state.targetPlayerCount || 6;
  const currentCount = state.players.length;
  const isFull = currentCount === targetCount;

  return (
    <div className="panel">
      <div className="eyebrow">WAITING ROOM</div>
      <h2>Gather your crew</h2>
      <p className="muted">
        Share the room code or QR code. Game starts once all {targetCount} player slots are filled.
      </p>

      <QRCodeCard roomCode={roomCode} onCopySuccess={onNotice} />

      {/* Roster & Capacity Tracker */}
      <div style={{ margin: '20px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800 }}>PLAYERS JOINED</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: isFull ? 'var(--green)' : 'var(--accent)'
            }}
          >
            {currentCount} / {targetCount} {isFull ? '✅ Ready!' : 'Waiting…'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {state.players.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#1c2333',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)'
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#2b364d',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '13px',
                  color: 'var(--accent)'
                }}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, flex: 1 }}>
                {p.name}
                {p.id === playerId ? ' (You)' : ''}
                {p.id === state.hostId ? ' 👑 Host' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Host Configuration Panel */}
      <ConfigSliders
        settings={state.settings}
        onUpdate={onUpdateSettings}
        isHost={isHost}
      />

      {/* Start Button */}
      {isHost ? (
        <button
          className="primary full"
          disabled={!isFull}
          onClick={onStartGame}
          style={{ marginTop: '20px' }}
        >
          {isFull
            ? `Start Game (${currentCount}/${targetCount} Players) 🚀`
            : `Waiting for players (${currentCount}/${targetCount})`}
        </button>
      ) : (
        <p className="hint center">
          Waiting for the host ({state.players.find(p => p.id === state.hostId)?.name || 'Host'}) to start once all {targetCount} join…
        </p>
      )}
    </div>
  );
}
