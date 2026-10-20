export default function ClueInspector({
  player,
  clues = [],
  currentNote,
  onSetNote,
  onClose
}) {
  if (!player) return null;

  const playerClues = clues.filter(c => c.playerId === player.id);
  const canTag = playerClues.length >= 1;

  return (
    <div className="inspector-backdrop" onClick={onClose}>
      <div className="inspector-card" onClick={e => e.stopPropagation()}>
        <div className="inspector-header">
          <div>
            <div className="eyebrow" style={{ margin: 0 }}>
              PRIVATE DOSSIER
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
              {player.name}
            </h3>
          </div>
          <button className="ghost small" onClick={onClose} style={{ fontSize: '16px' }}>
            ✕
          </button>
        </div>

        {/* Clues List */}
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          CLUES GIVEN ({playerClues.length})
        </div>

        <div className="inspector-clues-list">
          {playerClues.length === 0 ? (
            <p className="muted" style={{ fontSize: '12px', padding: '12px 0' }}>
              No clues given yet in this game.
            </p>
          ) : (
            playerClues.map((c, i) => (
              <div key={i} className="inspector-clue-item">
                <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                  Round {i + 1}
                </span>
                <strong style={{ fontSize: '13px', color: '#fff' }}>"{c.text}"</strong>
              </div>
            ))
          )}
        </div>

        {/* Private Gut Reactions */}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)' }}>
              YOUR PRIVATE GUT REACTION
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              (Visible only to you)
            </span>
          </div>

          {canTag ? (
            <div className="gut-reactions-row">
              <button
                className={`reaction-btn ${currentNote === 'safe' ? 'active safe' : ''}`}
                onClick={() => onSetNote(player.id, 'safe')}
              >
                🟢 Safe
              </button>
              <button
                className={`reaction-btn ${currentNote === 'unsure' ? 'active unsure' : ''}`}
                onClick={() => onSetNote(player.id, 'unsure')}
              >
                🤔 Unsure
              </button>
              <button
                className={`reaction-btn ${currentNote === 'sus' ? 'active sus' : ''}`}
                onClick={() => onSetNote(player.id, 'sus')}
              >
                🚩 Sus
              </button>
            </div>
          ) : (
            <p className="hint" style={{ textAlign: 'left', marginTop: '8px' }}>
              ⏳ Gut reactions unlock once {player.name} has submitted at least 1 clue.
            </p>
          )}
        </div>

        <button className="secondary full" onClick={onClose} style={{ marginTop: '18px' }}>
          Done
        </button>
      </div>
    </div>
  );
}
