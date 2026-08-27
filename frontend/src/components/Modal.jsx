import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${width} card mt-10 sm:mt-0 animate-[fadeIn_.15s_ease-out]`}>
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
