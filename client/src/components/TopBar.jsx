export default function TopBar({ connected, inGame, onLeave }) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#"
        onClick={e => {
          e.preventDefault();
          if (inGame && onLeave) onLeave();
        }}
      >
        UNDERCOVER<span>PARTY</span>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span className={`connection ${connected ? 'online' : ''}`}>
          <i />
          {connected ? 'Live' : 'Connecting…'}
        </span>
        {inGame && (
          <button className="ghost small" onClick={onLeave}>
            Exit
          </button>
        )}
      </div>
    </header>
  );
}
