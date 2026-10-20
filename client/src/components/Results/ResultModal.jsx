export default function ResultModal({
  result,
  players,
  isHost,
  onRestart
}) {
  if (!result) return null;

  const winner = result.winner;
  const isCivilianWin = winner === 'innocent';
  const isUndercoverWin = winner === 'undercover';
  const isStrangerWin = winner === 'stranger';

  const headline = isCivilianWin
    ? '😇 The Innocents Win!'
    : isUndercoverWin
    ? '🕵️ The Undercovers Win!'
    : '👤 The Stranger Wins!';

  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div className="eyebrow">GAME OVER</div>
      <h2 style={{ fontSize: '26px' }}>{headline}</h2>
      <p className="muted" style={{ maxWidth: '440px', margin: '0 auto 18px' }}>
        {result.message}
      </p>

      {/* Secret words reveal */}
      <div className="secret-card" style={{ margin: '18px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <div className="secret-label">INNOCENT WORD</div>
            <strong style={{ fontSize: '20px', color: 'var(--green)' }}>
              {result.innocentWord}
            </strong>
          </div>
          <div>
            <div className="secret-label">UNDERCOVER WORD</div>
            <strong style={{ fontSize: '20px', color: 'var(--accent)' }}>
              {result.undercoverWord}
            </strong>
          </div>
        </div>
      </div>

      {/* All players and their revealed roles */}
      <div style={{ textAlign: 'left', margin: '20px 0' }}>
        <div className="eyebrow">FINAL ROLE REVEAL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {players.map(p => {
            const role = result.roles ? result.roles[p.id] : null;
            const roleBadge =
              role === 'innocent'
                ? '😇 Innocent'
                : role === 'undercover'
                ? '🕵️ Undercover'
                : role === 'stranger'
                ? '👤 Stranger'
                : 'Player';

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#1c2333',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#28334a',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '12px'
                    }}
                  >
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>
                    {p.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background:
                      role === 'innocent'
                        ? 'rgba(72, 213, 151, 0.15)'
                        : role === 'undercover'
                        ? 'rgba(135, 153, 255, 0.15)'
                        : 'rgba(245, 176, 65, 0.15)',
                    color:
                      role === 'innocent'
                        ? 'var(--green)'
                        : role === 'undercover'
                        ? 'var(--accent)'
                        : 'var(--yellow)'
                  }}
                >
                  {roleBadge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isHost ? (
        <button className="primary full" onClick={onRestart}>
          Play Another Round 🔄
        </button>
      ) : (
        <p className="hint center">Waiting for the host to start a rematch…</p>
      )}
    </div>
  );
}
