'use client';

import { useState } from 'react';

// Compact voicemail cell: a play button that opens the player on demand (so the
// table doesn't load every file), and a "new" badge until it is first played.
export default function Voicemail({ src, unheard }: { src: string; unheard: boolean }) {
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(unheard);

  return (
    <span className="vm">
      {open ? (
        <audio className="vm-audio" controls autoPlay preload="none" src={src} onPlay={() => setIsNew(false)} />
      ) : (
        <button type="button" className="vm-play" onClick={() => setOpen(true)} aria-label="მოსმენა">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" /></svg>
          მოსმენა
        </button>
      )}
      {isNew && <span className="vm-new">ახალი</span>}
    </span>
  );
}
