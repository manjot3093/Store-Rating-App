import React, { useState } from 'react';

export default function StarInput({ value, onSubmit, disabled }) {
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const display = hover || value || 0;

  const handleClick = async (n) => {
    if (disabled || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(n);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Submit a rating from 1 to 5"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled || submitting}
          onMouseEnter={() => setHover(n)}
          onClick={() => handleClick(n)}
          aria-label={`Rate ${n} out of 5`}
          className="p-0.5 disabled:cursor-not-allowed transition-transform hover:scale-110"
        >
          <svg
            viewBox="0 0 20 20"
            className={`w-6 h-6 ${n <= display ? 'text-clay-500' : 'text-ink/15'}`}
          >
            <path
              d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z"
              fill={n <= display ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
