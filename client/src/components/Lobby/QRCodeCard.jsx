import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function QRCodeCard({ roomCode, onCopySuccess }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?join=${roomCode}`
      : `?join=${roomCode}`;

  useEffect(() => {
    if (roomCode) {
      QRCode.toDataURL(joinUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0d111a',
          light: '#ffffff'
        }
      })
        .then(url => setQrUrl(url))
        .catch(err => console.error('Failed to generate QR:', err));
    }
  }, [roomCode, joinUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      if (onCopySuccess) onCopySuccess('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (onCopySuccess) onCopySuccess(`Room Code: ${roomCode}`);
    }
  };

  return (
    <div className="qr-card" onClick={handleCopy} title="Click to copy code">
      {qrUrl ? (
        <img src={qrUrl} alt={`QR Code for room ${roomCode}`} width="150" height="150" />
      ) : (
        <div style={{ height: '150px', display: 'grid', placeItems: 'center' }}>
          Loading QR…
        </div>
      )}
      <div className="room-code-badge">{roomCode}</div>
      <span className="hint" style={{ marginTop: '6px' }}>
        {copied ? '✅ Copied to clipboard!' : '📷 Scan with phone camera or tap to copy'}
      </span>
    </div>
  );
}
