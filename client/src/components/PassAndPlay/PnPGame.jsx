import { useState, useMemo } from 'react';
import Slider from '../ui/Slider.jsx';

const DEFAULT_WORD_PAIRS = [
  ['Coffee', 'Tea'], ['Cat', 'Dog'], ['Beach', 'Pool'], ['Pizza', 'Burger'],
  ['Moon', 'Sun'], ['Train', 'Bus'], ['Rain', 'Snow'], ['Guitar', 'Piano'],
  ['Apple', 'Orange'], ['School', 'College'], ['Cricket', 'Football'],
  ['Mountain', 'Hill'], ['Shark', 'Dolphin'], ['Book', 'Movie'], ['Cake', 'Ice cream']
];

export default function PnPGame({ onExit }) {
  const [step, setStep] = useState('setup'); // 'setup' | 'reveal' | 'clue' | 'vote' | 'result'
  const [playerCount, setPlayerCount] = useState(5);
  const [names, setNames] = useState([
    'Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'
  ]);
  const [undercovers, setUndercovers] = useState(1);
  const [strangers, setStrangers] = useState(1);

  // Active game session state
  const [players, setPlayers] = useState([]);
  const [words, setWords] = useState({ innocent: '', undercover: '' });
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [isHoldingWord, setIsHoldingWord] = useState(false);
  const [clues, setClues] = useState([]);
  const [clueInput, setClueInput] = useState('');
  const [votes, setVotes] = useState({});
  const [result, setResult] = useState(null);

  const maxSpecial = Math.floor((playerCount - 1) / 2);

  const handlePlayerCountChange = newCount => {
    setPlayerCount(newCount);
    setNames(prev => {
      const updated = [...prev];
      while (updated.length < newCount) {
        updated.push(`Player ${updated.length + 1}`);
      }
      return updated.slice(0, newCount);
    });

    const newMaxSpecial = Math.floor((newCount - 1) / 2);
    if (newCount === 3) {
      setUndercovers(1);
      setStrangers(0);
    } else if (undercovers + strangers > newMaxSpecial) {
      setUndercovers(Math.min(undercovers, newMaxSpecial));
      setStrangers(Math.max(0, newMaxSpecial - Math.min(undercovers, newMaxSpecial)));
    }
  };

  const startGame = () => {
    const pair = DEFAULT_WORD_PAIRS[Math.floor(Math.random() * DEFAULT_WORD_PAIRS.length)];
    const assignedWords = { innocent: pair[0], undercover: pair[1] };
    setWords(assignedWords);

    // Shuffle and assign roles
    const indices = [...Array(playerCount).keys()].sort(() => Math.random() - 0.5);
    const roleMap = {};

    let idx = 0;
    for (let i = 0; i < undercovers; i++) roleMap[indices[idx++]] = 'undercover';
    for (let i = 0; i < strangers; i++) roleMap[indices[idx++]] = 'stranger';
    while (idx < playerCount) roleMap[indices[idx++]] = 'innocent';

    const usedCodes = new Set();
    const playerObjects = names.map((name, i) => {
      let code = Math.floor(Math.random() * 20) + 1;
      while (usedCodes.has(code)) code = Math.floor(Math.random() * 20) + 1;
      usedCodes.add(code);

      return {
        id: `p-${i}`,
        name: name.trim() || `Player ${i + 1}`,
        role: roleMap[i],
        word:
          roleMap[i] === 'innocent'
            ? assignedWords.innocent
            : roleMap[i] === 'undercover'
            ? assignedWords.undercover
            : null,
        passCode: code,
        eliminated: false
      };
    });

    setPlayers(playerObjects);
    setCurrentTurnIdx(0);
    setClues([]);
    setVotes({});
    setResult(null);
    setStep('reveal');
  };

  const activePlayers = players.filter(p => !p.eliminated);
  const currentPlayer = activePlayers[currentTurnIdx];

  // Advance role reveal
  const handleNextReveal = () => {
    setIsHoldingWord(false);
    if (currentTurnIdx + 1 < activePlayers.length) {
      setCurrentTurnIdx(prev => prev + 1);
    } else {
      // Done with all reveals! Start clues
      setCurrentTurnIdx(0);
      setStep('clue');
    }
  };

  // Submit clue in Pass & Play
  const handleSubmitClue = () => {
    if (!clueInput.trim()) return;
    setClues(prev => [
      ...prev,
      { playerId: currentPlayer.id, name: currentPlayer.name, text: clueInput.trim() }
    ]);
    setClueInput('');

    if (currentTurnIdx + 1 < activePlayers.length) {
      setCurrentTurnIdx(prev => prev + 1);
    } else {
      // All clues submitted! Go to voting
      setStep('vote');
    }
  };

  // Cast vote in Pass & Play
  const handleVoteSubmit = targetId => {
    const voterId = currentPlayer.id;
    const newVotes = { ...votes, [voterId]: targetId };
    setVotes(newVotes);

    if (currentTurnIdx + 1 < activePlayers.length) {
      setCurrentTurnIdx(prev => prev + 1);
    } else {
      // All votes in! Resolve winner
      resolvePnpVotes(newVotes);
    }
  };

  const resolvePnpVotes = finalVotes => {
    const counts = {};
    for (const tid of Object.values(finalVotes)) {
      counts[tid] = (counts[tid] || 0) + 1;
    }
    const max = Math.max(0, ...Object.values(counts));
    const leaders = Object.keys(counts).filter(id => counts[id] === max);

    if (leaders.length !== 1) {
      // Tie -> restart clue round
      alert('The vote was tied! Pass the phone for another round of clues.');
      setCurrentTurnIdx(0);
      setVotes({});
      setStep('clue');
      return;
    }

    const eliminated = players.find(p => p.id === leaders[0]);
    eliminated.eliminated = true;

    // Check win condition
    const living = players.filter(p => !p.eliminated);
    const undercoversAlive = living.filter(p => p.role === 'undercover').length;
    const strangersAlive = living.filter(p => p.role === 'stranger').length;
    const innocentsAlive = living.filter(p => p.role === 'innocent').length;
    const totalInfiltrators = undercoversAlive + strangersAlive;

    if (totalInfiltrators === 0) {
      setResult({
        winner: 'innocent',
        message: 'All infiltrators were eliminated! Innocents win!'
      });
      setStep('result');
    } else if (totalInfiltrators >= innocentsAlive) {
      setResult({
        winner: 'undercover',
        message: 'Infiltrators equal or outnumber Innocents! Infiltrators win!'
      });
      setStep('result');
    } else {
      alert(`${eliminated.name} was eliminated! Continuing to next round.`);
      setCurrentTurnIdx(0);
      setVotes({});
      setStep('clue');
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '30px auto', width: '100%' }}>
      {/* 1. SETUP */}
      {step === 'setup' && (
        <div className="panel">
          <div className="eyebrow">OFFLINE PARTY MODE</div>
          <h2>Pass & Play Setup</h2>
          <p className="muted">
            Pass a single phone around the circle. Each player gets an allotted
            secret pass code to protect their identity.
          </p>

          <Slider
            label="Target Players"
            value={playerCount}
            min={3}
            max={10}
            onChange={handlePlayerCountChange}
            formatValue={v => `${v} Players`}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Slider
              label="Undercovers"
              value={undercovers}
              min={playerCount === 3 ? 0 : 1}
              max={maxSpecial}
              onChange={v => setUndercovers(v)}
            />
            <Slider
              label="Strangers"
              value={strangers}
              min={0}
              max={playerCount === 3 ? 1 : Math.max(0, maxSpecial - 1)}
              onChange={v => setStrangers(v)}
            />
          </div>

          <div style={{ margin: '16px 0' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)' }}>
              PLAYER NAMES
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {names.map((n, i) => (
                <input
                  key={i}
                  value={n}
                  maxLength={16}
                  placeholder={`Player ${i + 1}`}
                  onChange={e => {
                    const copy = [...names];
                    copy[i] = e.target.value;
                    setNames(copy);
                  }}
                />
              ))}
            </div>
          </div>

          <button className="primary full" onClick={startGame}>
            Start Pass & Play Game 🚀
          </button>
          <button className="ghost full" onClick={onExit} style={{ marginTop: '8px' }}>
            Cancel & Back to Home
          </button>
        </div>
      )}

      {/* 2. REVEAL */}
      {step === 'reveal' && currentPlayer && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="eyebrow">STEP 1: SECRET ROLE REVEAL</div>
          <h2 style={{ fontSize: '26px' }}>📱 Pass phone to:</h2>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent)', margin: '10px 0' }}>
            {currentPlayer.name}
          </div>
          <p className="muted">
            Your allotted pass code is: <strong style={{ color: '#fff' }}>#{currentPlayer.passCode}</strong>
          </p>

          <div className="secret-card" style={{ margin: '20px 0' }}>
            {isHoldingWord ? (
              <>
                <div className="secret-label">YOUR ROLE</div>
                <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '10px' }}>
                  {currentPlayer.role === 'innocent'
                    ? '😇 Innocent'
                    : currentPlayer.role === 'undercover'
                    ? '🕵️ Undercover'
                    : '👤 Stranger'}
                </div>
                <div className="secret-label">YOUR WORD</div>
                <div className="secret-word">
                  {currentPlayer.word || 'NO WORD — BLUFF BLINDLY!'}
                </div>
              </>
            ) : (
              <button
                className="hold-to-reveal-btn"
                onPointerDown={() => setIsHoldingWord(true)}
                onPointerUp={() => setIsHoldingWord(false)}
                onPointerLeave={() => setIsHoldingWord(false)}
              >
                🔒 PRESS & HOLD TO REVEAL WORD
              </button>
            )}
          </div>

          <button className="primary full" onClick={handleNextReveal}>
            I've Memorized It → Pass to Next Player ➡️
          </button>
        </div>
      )}

      {/* 3. CLUES */}
      {step === 'clue' && currentPlayer && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="eyebrow">STEP 2: CLUE TIME</div>
          <h2>📱 Hand phone to:</h2>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--accent)', margin: '8px 0' }}>
            {currentPlayer.name}
          </div>
          <p className="muted">Type one word or short clue about your secret word:</p>

          <div style={{ maxWidth: '380px', margin: '20px auto 0' }}>
            <input
              value={clueInput}
              maxLength={70}
              placeholder="Your clue…"
              autoFocus
              onChange={e => setClueInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmitClue()}
            />
            <button
              className="primary full"
              disabled={!clueInput.trim()}
              onClick={handleSubmitClue}
            >
              Submit & Pass Phone 🎤
            </button>
          </div>
        </div>
      )}

      {/* 4. VOTING */}
      {step === 'vote' && currentPlayer && (
        <div className="panel">
          <div className="eyebrow">STEP 3: SECRET VOTE</div>
          <h2>📱 Hand phone to: {currentPlayer.name}</h2>
          <p className="muted">Pick the player you think is the Infiltrator or Stranger:</p>

          <div className="ballot-list">
            {activePlayers
              .filter(p => p.id !== currentPlayer.id)
              .map(p => (
                <button
                  key={p.id}
                  className="ballot-item"
                  onClick={() => handleVoteSubmit(p.id)}
                  style={{ width: '100%' }}
                >
                  <span style={{ fontWeight: 800 }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent)' }}>Tap to vote</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 5. RESULTS */}
      {step === 'result' && result && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="eyebrow">GAME OVER</div>
          <h2>{result.winner === 'innocent' ? '😇 Innocents Win!' : '🕵️ Infiltrators Win!'}</h2>
          <p className="muted">{result.message}</p>

          <div className="secret-card">
            <div>Innocent Word: <strong style={{ color: 'var(--green)' }}>{words.innocent}</strong></div>
            <div style={{ marginTop: '8px' }}>Undercover Word: <strong style={{ color: 'var(--accent)' }}>{words.undercover}</strong></div>
          </div>

          <div style={{ textAlign: 'left', margin: '18px 0' }}>
            {players.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#1c2333',
                  borderRadius: '8px',
                  marginBottom: '6px'
                }}
              >
                <span>{p.name}</span>
                <span style={{ fontWeight: 800 }}>
                  {p.role === 'innocent' ? '😇 Innocent' : p.role === 'undercover' ? '🕵️ Undercover' : '👤 Stranger'}
                </span>
              </div>
            ))}
          </div>

          <button className="primary full" onClick={startGame}>
            Play Again 🔄
          </button>
          <button className="ghost full" onClick={onExit} style={{ marginTop: '8px' }}>
            Exit Pass & Play
          </button>
        </div>
      )}
    </div>
  );
}
