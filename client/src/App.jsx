import { useState } from 'react';
import './styles/global.css';
import './styles/components.css';

import { useSocket } from './hooks/useSocket.js';
import { useNotes } from './hooks/useNotes.js';

import TopBar from './components/TopBar.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import LobbyView from './components/Lobby/LobbyView.jsx';
import RoleRevealModal from './components/Results/RoleRevealModal.jsx';
import SpotlightStage from './components/Stage/SpotlightStage.jsx';
import AvatarDock from './components/Stage/AvatarDock.jsx';
import ClueInspector from './components/Stage/ClueInspector.jsx';
import DiscussionView from './components/Voting/DiscussionView.jsx';
import VotingBallot from './components/Voting/VotingBallot.jsx';
import StrangerGuess from './components/Results/StrangerGuess.jsx';
import ResultModal from './components/Results/ResultModal.jsx';
import PnPGame from './components/PassAndPlay/PnPGame.jsx';

export default function App() {
  const {
    playerId,
    connected,
    roomCode,
    state,
    privateInfo,
    error,
    setError,
    notice,
    setNotice,
    act,
    resetRoom
  } = useSocket();

  const [screen, setScreen] = useState('home'); // 'home' | 'game' | 'pass-and-play'
  const [inspectingPlayer, setInspectingPlayer] = useState(null);

  // Private detective notebook stored in sessionStorage
  const { getNote, setNote, clearNotes } = useNotes(roomCode);

  // Actions
  const handleCreateRoom = (name, settings = {}) => {
    act('room:create', { name, settings }, res => {
      if (res?.ok) {
        clearNotes();
        setScreen('game');
      }
    });
  };

  const handleJoinRoom = (name, code) => {
    act('room:join', { name, code }, res => {
      if (res?.ok) {
        clearNotes();
        setScreen('game');
      }
    });
  };

  const handleStartGame = () => act('game:start');
  const handleUpdateSettings = settings => act('room:update_settings', { settings });
  const handleReady = () => act('role:ready');
  const handleSubmitClue = clue => act('clue:submit', { clue });
  const handleOpenVoting = () => act('vote:open');
  const handleCastVote = targetId => act('vote:cast', { targetId });
  const handleSubmitStrangerGuess = guess => act('stranger:guess', { guess });
  const handleRestartGame = () => {
    clearNotes();
    act('game:restart');
  };

  const handleLeave = () => {
    resetRoom();
    clearNotes();
    setScreen('home');
  };

  // In-game computed values
  const me = state?.players?.find(p => p.id === playerId);
  const activePlayers = state?.players?.filter(p => !p.eliminated) || [];
  const isMyClueTurn =
    state?.phase === 'clue' && state?.currentCluePlayerId === playerId;
  const alreadyVoted = state?.votedPlayerIds?.includes(playerId);

  return (
    <main className="shell">
      <TopBar
        connected={connected}
        inGame={screen === 'game' || screen === 'pass-and-play'}
        onLeave={handleLeave}
      />

      {error && <div className="error">{error}</div>}
      {notice && <div className="notice">{notice}</div>}

      {/* Screen 1: Home Screen */}
      {screen === 'home' && (
        <HomeScreen
          connected={connected}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartPassAndPlay={() => setScreen('pass-and-play')}
        />
      )}

      {/* Screen 2: Pass & Play Offline Mode */}
      {screen === 'pass-and-play' && (
        <PnPGame onExit={() => setScreen('home')} />
      )}

      {/* Screen 3: Online Game Screen */}
      {screen === 'game' && state && (
        <section style={{ maxWidth: '580px', margin: '24px auto', width: '100%' }}>
          {/* Phase 1: Lobby */}
          {state.phase === 'lobby' && (
            <LobbyView
              roomCode={roomCode}
              state={state}
              playerId={playerId}
              onStartGame={handleStartGame}
              onUpdateSettings={handleUpdateSettings}
              onNotice={msg => {
                setNotice(msg);
                setTimeout(() => setNotice(''), 2500);
              }}
            />
          )}

          {/* Phase 2: Role Reveal */}
          {state.phase === 'role' && (
            <RoleRevealModal
              role={privateInfo?.role}
              word={privateInfo?.word}
              isReady={state.readyPlayerIds.includes(playerId)}
              readyCount={state.readyPlayerIds.length}
              totalCount={state.players.length}
              onReady={handleReady}
            />
          )}

          {/* Active Gameplay Phases */}
          {state.phase !== 'lobby' && state.phase !== 'role' && (
            <>
              {/* TOP STAGE: Spotlight or Phase Action */}
              {state.phase === 'clue' && (
                <SpotlightStage
                  currentCluePlayerId={state.currentCluePlayerId}
                  currentCluePlayerName={state.currentCluePlayerName}
                  isMyTurn={isMyClueTurn}
                  turnExpiresAt={state.turnExpiresAt}
                  clueTimer={state.settings.clueTimer}
                  onSubmitClue={handleSubmitClue}
                />
              )}

              {state.phase === 'discussion' && (
                <DiscussionView
                  turnExpiresAt={state.turnExpiresAt}
                  roundTimer={state.settings.roundTimer}
                  isHost={state.hostId === playerId}
                  onOpenVoting={handleOpenVoting}
                />
              )}

              {state.phase === 'vote' && (
                <VotingBallot
                  players={state.players}
                  meId={playerId}
                  turnExpiresAt={state.turnExpiresAt}
                  roundTimer={state.settings.roundTimer}
                  alreadyVoted={alreadyVoted}
                  votedCount={state.votedPlayerIds.length}
                  totalActiveCount={activePlayers.length}
                  getNote={getNote}
                  onCastVote={handleCastVote}
                />
              )}

              {state.phase === 'stranger_guess' && (
                <StrangerGuess
                  isMe={privateInfo?.role === 'stranger' && state.eliminatedPlayerId === playerId}
                  strangerName={state.players.find(p => p.id === state.eliminatedPlayerId)?.name}
                  turnExpiresAt={state.turnExpiresAt}
                  onSubmitGuess={handleSubmitStrangerGuess}
                />
              )}

              {state.phase === 'result' && (
                <ResultModal
                  result={state.result}
                  players={state.players}
                  isHost={state.hostId === playerId}
                  onRestart={handleRestartGame}
                />
              )}

              {/* BOTTOM DOCK: Avatar Dock for inspecting clues & gut reactions */}
              {state.phase !== 'result' && (
                <AvatarDock
                  players={state.players}
                  clues={state.clues}
                  currentCluePlayerId={state.currentCluePlayerId}
                  meId={playerId}
                  getNote={getNote}
                  onSelectPlayer={player => setInspectingPlayer(player)}
                />
              )}

              {/* Floating Clue Inspector */}
              {inspectingPlayer && (
                <ClueInspector
                  player={inspectingPlayer}
                  clues={state.clues}
                  currentNote={getNote(inspectingPlayer.id)}
                  onSetNote={(targetId, tag) => setNote(targetId, tag)}
                  onClose={() => setInspectingPlayer(null)}
                />
              )}
            </>
          )}
        </section>
      )}

      <footer>
        <span>UNDERCOVER PARTY</span>
        <span>BLUFF SMART. TRUST SLOWLY.</span>
      </footer>
    </main>
  );
}
