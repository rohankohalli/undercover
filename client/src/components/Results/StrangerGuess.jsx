import { useState } from 'react';
import TimerRing from '../ui/TimerRing.jsx';

export default function StrangerGuess({
  isMe,
  strangerName,
  turnExpiresAt,
  onSubmitGuess
}) {
  const [guess, setGuess] = useState('');

  const handleSend = () => {
    if (!guess.trim()) return;
    onSubmitGuess(guess.trim());
  };

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
          LAST CHANCE GUESS
        </div>
        <TimerRing expiresAt={turnExpiresAt} totalDuration={45} size={42} />
      </div>

      <h2>
        {isMe
          ? 'Guess the Innocents’ Word!'
          : `${strangerName || 'Stranger'} is making their final guess…`}
      </h2>

      <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 16px' }}>
        {isMe
          ? 'You were eliminated as the Stranger, but if you correctly guess the exact word the Innocents had, you STEAL THE WIN!'
          : 'The eliminated Stranger gets one chance to steal the victory by guessing the Innocents’ word.'}
      </p>

      {isMe ? (
        <div style={{ maxWidth: '360px', margin: '0 auto' }}>
          <input
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="What was their secret word?"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            className="primary full"
            disabled={!guess.trim()}
            onClick={handleSend}
          >
            Submit Final Guess 🎯
          </button>
        </div>
      ) : (
        <div className="notice">
          Holding breath… Stranger is typing their guess…
        </div>
      )}
    </div>
  );
}
