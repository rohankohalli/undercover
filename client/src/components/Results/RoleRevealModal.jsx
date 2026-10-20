export default function RoleRevealModal({
  role,
  word,
  isReady,
  readyCount,
  totalCount,
  onReady
}) {
  const roleName =
    role === 'innocent'
      ? 'Innocent'
      : role === 'undercover'
      ? 'Undercover Infiltrator'
      : role === 'stranger'
      ? 'Stranger (Bluffer)'
      : 'Unknown';

  const roleEmoji =
    role === 'innocent' ? '😇' : role === 'undercover' ? '🕵️' : '👤';

  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div className="eyebrow">YOUR SECRET IDENTITY</div>
      <h2>Memorize your role</h2>
      <p className="muted">
        Do not let anyone see your screen. When everyone is ready, clues begin!
      </p>

      <div className="secret-card">
        <div className="secret-label">YOUR ASSIGNED ROLE</div>
        <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '14px' }}>
          {roleEmoji} {roleName}
        </div>

        <div className="secret-label">YOUR SECRET WORD</div>
        <div className="secret-word">
          {word || 'NO WORD — BLUFF BLINDLY!'}
        </div>

        {role === 'stranger' && (
          <p className="hint" style={{ color: 'var(--yellow)', margin: '0 auto' }}>
            ⚠️ You have no word! Listen carefully to other players' clues and
            pretend you know what they're talking about!
          </p>
        )}
      </div>

      {isReady ? (
        <div className="notice">
          ✅ You're ready. Waiting for other players ({readyCount}/{totalCount})…
        </div>
      ) : (
        <button className="primary full" onClick={onReady}>
          I've Memorized My Word & Role 🔒
        </button>
      )}
    </div>
  );
}
