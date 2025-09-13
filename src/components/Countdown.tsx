import React, { useEffect, useState } from 'react';

interface Props {
  expiryMs: number | null; // milliseconds since epoch (UTC)
  className?: string;
}

const formatRemaining = (ms: number) => {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hrs = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hrs}h ${min}m ${sec}s`;
};

const Countdown: React.FC<Props> = ({ expiryMs, className }) => {
  const [remaining, setRemaining] = useState<number | null>(
    expiryMs ? Math.max(0, expiryMs - Date.now()) : null
  );

  useEffect(() => {
    if (!expiryMs) {
      setRemaining(null);
      return;
    }
    const update = () => setRemaining(Math.max(0, expiryMs - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiryMs]);

  if (remaining === null) return <span className={className} aria-live="polite">Calculating...</span>;
  if (remaining <= 0) return <span className={className} aria-live="polite">Expired</span>;
  return <span className={className} aria-live="polite">{formatRemaining(remaining)}</span>;
};

export default Countdown;
