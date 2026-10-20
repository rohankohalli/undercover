import Slider from '../ui/Slider.jsx';

const CATEGORIES = [
  { id: 'random', label: '🎲 Everything / Random' },
  { id: 'food', label: '🍕 Food & Drinks' },
  { id: 'movies', label: '🎬 Movies & Pop Culture' },
  { id: 'gaming', label: '🎮 Video Games' },
  { id: 'sports', label: '🏏 Sports' },
  { id: 'travel', label: '🌍 Travel & Places' },
  { id: 'tech', label: '💻 Tech & Gadgets' }
];

const CLUE_TIMERS = [20, 30, 45, 60];
const ROUND_TIMERS = [45, 60, 90, 120];

export default function ConfigSliders({ settings, onUpdate, isHost }) {
  const playerCount = settings.playerCount || 6;
  const undercovers = settings.undercovers || 1;
  const strangers = settings.strangers ?? 1;
  const clueTimer = settings.clueTimer || 45;
  const roundTimer = settings.roundTimer || 60;
  const maxRounds = settings.maxRounds || 4;
  const category = settings.category || 'random';

  // Strict rule: Special roles (UC + Stranger) < playerCount / 2
  const maxSpecial = Math.floor((playerCount - 1) / 2);

  // Suggested max rounds based on player count
  const suggestedRounds =
    playerCount <= 4 ? 3 : playerCount <= 6 ? 4 : playerCount <= 8 ? 5 : 6;

  const handlePlayerCountChange = newCount => {
    const newMaxSpecial = Math.floor((newCount - 1) / 2);
    let newUc = undercovers;
    let newStr = strangers;

    if (newCount === 3) {
      // At 3 players: max special is 1 (pick 1 UC or 1 Stranger)
      newUc = 1;
      newStr = 0;
    } else if (newUc + newStr > newMaxSpecial) {
      newUc = Math.min(newUc, newMaxSpecial);
      newStr = Math.max(0, newMaxSpecial - newUc);
    }

    const newSuggestedRounds =
      newCount <= 4 ? 3 : newCount <= 6 ? 4 : newCount <= 8 ? 5 : 6;

    onUpdate({
      playerCount: newCount,
      undercovers: newUc,
      strangers: newStr,
      maxRounds: newSuggestedRounds
    });
  };

  const handleUndercoverChange = newUc => {
    let newStr = strangers;
    if (playerCount === 3) {
      newStr = newUc > 0 ? 0 : 1;
    } else if (newUc + newStr > maxSpecial) {
      newStr = Math.max(0, maxSpecial - newUc);
    }
    onUpdate({ undercovers: newUc, strangers: newStr });
  };

  const handleStrangerChange = newStr => {
    let newUc = undercovers;
    if (playerCount === 3) {
      newUc = newStr > 0 ? 0 : 1;
    } else if (newUc + newStr > maxSpecial) {
      newUc = Math.max(1, maxSpecial - newStr);
    }
    onUpdate({ undercovers: newUc, strangers: newStr });
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
      <div className="eyebrow">ROOM SETTINGS {isHost ? '(HOST CONTROLS)' : '(READ ONLY)'}</div>

      {/* Target Players Slider */}
      <Slider
        label="🎯 Target Players (Room Capacity)"
        value={playerCount}
        min={3}
        max={10}
        disabled={!isHost}
        onChange={handlePlayerCountChange}
        formatValue={v => `${v} Players`}
      />

      {/* Undercover Slider */}
      <Slider
        label="🕵️ Undercovers"
        value={undercovers}
        min={playerCount === 3 ? 0 : 1}
        max={maxSpecial}
        disabled={!isHost}
        onChange={handleUndercoverChange}
        formatValue={v => `${v} (Max ${maxSpecial})`}
      />

      {/* Stranger Slider */}
      <Slider
        label="👤 Strangers (No Word, Can Bluff)"
        value={strangers}
        min={0}
        max={playerCount === 3 ? 1 : Math.max(0, maxSpecial - 1)}
        disabled={!isHost}
        onChange={handleStrangerChange}
        formatValue={v => `${v} (Can be 0)`}
      />

      {/* Category selector */}
      <div style={{ margin: '14px 0' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
          ✨ Word Topic / Category
        </label>
        <select
          value={category}
          disabled={!isHost}
          onChange={e => onUpdate({ category: e.target.value })}
        >
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timer Presets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            ⏱️ Clue Timer
          </label>
          <select
            value={clueTimer}
            disabled={!isHost}
            onChange={e => onUpdate({ clueTimer: Number(e.target.value) })}
          >
            {CLUE_TIMERS.map(t => (
              <option key={t} value={t}>
                {t}s per turn
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            🗳️ Vote Timer
          </label>
          <select
            value={roundTimer}
            disabled={!isHost}
            onChange={e => onUpdate({ roundTimer: Number(e.target.value) })}
          >
            {ROUND_TIMERS.map(t => (
              <option key={t} value={t}>
                {t}s per round
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Max Rounds */}
      <div style={{ margin: '14px 0' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
          🔄 Max Rounds (Undercovers win on survival)
        </label>
        <select
          value={maxRounds}
          disabled={!isHost}
          onChange={e => onUpdate({ maxRounds: Number(e.target.value) })}
        >
          {[2, 3, 4, 5, 6, 8].map(r => (
            <option key={r} value={r}>
              {r} Rounds {r === suggestedRounds ? '⭐ (Recommended)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
