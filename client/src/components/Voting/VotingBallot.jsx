import { useState } from 'react';
import TimerRing from '../ui/TimerRing.jsx';

export default function VotingBallot({
  players,
  meId,
  turnExpiresAt,
  roundTimer = 60,
  alreadyVoted,
  votedCount,
  totalActiveCount,
  getNote,
  onCastVote
}) {
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const livingTargets = players.filter(p => !p.eliminated && p.id !== meId);

  const formatNote = tag => {
    if (!tag) return '(—)';
    if (tag === 'safe') return '(🟢 Safe)';
    if (tag === 'unsure') return '(🤔 Unsure)';
    if (tag === 'sus') return '(🚩 Sus)';
    return '(—)';
  };

  const handleVote = () => {
    if (!selectedTargetId) return;
    onCastVote(selectedTargetId);
  };

  return (
    <div className="panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}
      >
        <div className="eyebrow" style={{ margin: 0 }}>
          CAST YOUR SECRET BALLOT
        </div>
        <TimerRing
          expiresAt={turnExpiresAt}
          totalDuration={roundTimer}
          size={42}
        />
      </div>

      <h2>Who is the Infiltrator?</h2>
      <p className="muted">
        Your vote is secret. Your private notes from earlier rounds are shown in
        parentheses to help you decide.
      </p>

      {alreadyVoted ? (
        <div className="notice" style={{ marginTop: '20px' }}>
          ✅ Your vote is locked in. Waiting for the rest of the group…
        </div>
      ) : (
        <>
          <div className="ballot-list">
            {livingTargets.map(p => {
              const noteTag = getNote ? getNote(p.id) : null;
              const isSelected = selectedTargetId === p.id;

              return (
                <div
                  key={p.id}
                  className={`ballot-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTargetId(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="ballot-player-info">
                    <span
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#2b364d',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '13px'
                      }}
                    >
                      {p.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      {p.name}
                    </span>
                  </div>

                  <span className="ballot-tag" style={{ color: noteTag === 'sus' ? 'var(--red)' : noteTag === 'safe' ? 'var(--green)' : 'var(--text-muted)' }}>
                    {formatNote(noteTag)}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            className="primary full"
            disabled={!selectedTargetId}
            onClick={handleVote}
          >
            Lock In Vote 🗳️
          </button>
        </>
      )}

      <p className="hint">
        {votedCount} / {totalActiveCount} votes cast
      </p>
    </div>
  );
}
