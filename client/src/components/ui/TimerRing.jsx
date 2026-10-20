import { useState, useEffect } from 'react';

export default function TimerRing({ expiresAt, totalDuration = 45, size = 48 }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(0);
      return;
    }

    const update = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(left);
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || remaining <= 0) return null;

  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, remaining / totalDuration));
  const strokeDashoffset = circumference * (1 - progress);

  const strokeColor =
    remaining <= 5 ? '#f35b6c' : remaining <= 10 ? '#f5b041' : '#8799ff';

  return (
    <div className="timer-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          stroke="#202737"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s'
          }}
        />
      </svg>
      <span className="timer-ring-text" style={{ color: strokeColor }}>
        {remaining}
      </span>
    </div>
  );
}
