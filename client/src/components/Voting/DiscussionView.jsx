import TimerRing from '../ui/TimerRing.jsx';

export default function DiscussionView({
  turnExpiresAt,
  roundTimer = 60,
  isHost,
  onOpenVoting
}) {
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}
      >
        <div className="eyebrow" style={{ margin: 0 }}>
          OPEN DISCUSSION
        </div>
        <TimerRing
          expiresAt={turnExpiresAt}
          totalDuration={roundTimer}
          size={42}
        />
      </div>

      <h2>Who Sounds Suspicious?</h2>
      <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 16px' }}>
        Talk out loud with your friends. Review previous clues by tapping avatars
        in the roster below, and tag your private gut reactions.
      </p>

      {isHost ? (
        <button className="primary full" onClick={onOpenVoting} style={{ maxWidth: '300px', margin: '14px auto 0' }}>
          Open Voting Now 🗳️
        </button>
      ) : (
        <p className="hint">
          Voting will open automatically when time runs out, or whenever the host opens it.
        </p>
      )}
    </div>
  );
}
