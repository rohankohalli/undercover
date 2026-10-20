import { useState } from 'react';
import TimerRing from '../ui/TimerRing.jsx';

export default function SpotlightStage({
  currentCluePlayerId,
  currentCluePlayerName,
  isMyTurn,
  turnExpiresAt,
  clueTimer = 45,
  onSubmitClue
}) {
  const [clueText, setClueText] = useState('');

  const handleSend = () => {
    if (!clueText.trim()) return;
    onSubmitClue(clueText.trim());
    setClueText('');
  };

  return (
    <div className="spotlight-stage">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}
      >
        <div className="eyebrow" style={{ margin: 0 }}>
          🌟 IN THE SPOTLIGHT
        </div>
        <TimerRing
          expiresAt={turnExpiresAt}
          totalDuration={clueTimer}
          size={42}
        />
      </div>

      <div className="spotlight-avatar">
        {currentCluePlayerName ? currentCluePlayerName.slice(0, 1).toUpperCase() : '?'}
      </div>

      <div className="spotlight-name">
        {isMyTurn ? 'Your Turn to Speak!' : `${currentCluePlayerName || 'A player'}`}
      </div>

      <div className="spotlight-status">
        {isMyTurn
          ? 'Say or type one word or short clue about your secret word. Do NOT say the word itself!'
          : 'Listening to clue…'}
      </div>

      {isMyTurn && (
        <div className="clue-input-box">
          <input
            value={clueText}
            maxLength={70}
            onChange={e => setClueText(e.target.value)}
            placeholder="Type your one-word or short clue…"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            className="primary"
            disabled={!clueText.trim()}
            onClick={handleSend}
          >
            Submit Clue 🎤
          </button>
        </div>
      )}
    </div>
  );
}
