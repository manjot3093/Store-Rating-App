import React from 'react';

const styles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  info: 'bg-brand-50 border-brand-200 text-brand-800',
};

export default function Alert({ type = 'info', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-medium flex items-start justify-between gap-3 ${styles[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
