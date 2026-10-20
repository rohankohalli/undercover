export default function AvatarDock({
  players,
  clues = [],
  currentCluePlayerId,
  meId,
  getNote,
  onSelectPlayer
}) {
  const getPlayerCluesCount = playerId => {
    return clues.filter(c => c.playerId === playerId).length;
  };

  return (
    <div className="dock-container">
      <div className="dock-header">
        <span>PLAYER ROSTER</span>
        <span style={{ color: 'var(--accent)' }}>TAP AVATAR TO VIEW CLUES & NOTES</span>
      </div>

      <div className="avatar-grid">
        {players.map(p => {
          const isTurn = p.id === currentCluePlayerId;
          const clueCount = getPlayerCluesCount(p.id);
          const noteTag = getNote ? getNote(p.id) : null;

          return (
            <div
              key={p.id}
              className="avatar-item"
              onClick={() => onSelectPlayer(p)}
              style={{ opacity: p.eliminated ? 0.35 : 1 }}
            >
              <div
                className={`avatar-circle ${isTurn ? 'active-turn' : ''} ${
                  clueCount > 0 ? 'has-clue' : ''
                }`}
              >
                {p.name.slice(0, 1).toUpperCase()}
                {clueCount > 0 && !p.eliminated && (
                  <span className="avatar-badge-icon" title={`${clueCount} clue(s)`}>
                    💬
                  </span>
                )}
                {p.eliminated && (
                  <span className="avatar-badge-icon">
                    ❌
                  </span>
                )}
              </div>

              <span className="avatar-label">
                {p.name}
                {p.id === meId ? ' (You)' : ''}
              </span>

              {noteTag && (
                <span className={`avatar-note-tag ${noteTag}`}>
                  {noteTag === 'safe' ? '🟢' : noteTag === 'unsure' ? '🤔' : '🚩'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
