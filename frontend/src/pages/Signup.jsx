import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { validateName, validateAddress, validateEmail, validatePassword, extractApiError } from '../utils/validation';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const errors = {
    name: validateName(form.name),
    email: validateEmail(form.email),
    address: validateAddress(form.address),
    password: validatePassword(form.password),
  };
  const isValid = Object.values(errors).every((e) => !e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, address: true, password: true });
    if (!isValid) return;
    setApiError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-9 h-9 rounded-md bg-ink flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-clay-400">
              <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display font-semibold text-xl">Storehouse</span>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <div className="eyebrow mb-1.5">Join the registry</div>
            <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
          </div>

          {apiError && (
            <div className="mb-5">
              <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="field-label" htmlFor="name">Full name</label>
              <input
                id="name"
                className="field-input"
                placeholder="Your full legal name (20–60 characters)"
                value={form.name}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="flex justify-between">
                {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
                <span className="text-[12px] text-ink/35 ml-auto font-mono">{form.name.length}/60</span>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={form.email}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div>
              <label className="field-label" htmlFor="address">Address</label>
              <textarea
                id="address"
                rows={2}
                className="field-input resize-none"
                placeholder="Street, city, state, postal code (max 400 characters)"
                value={form.address}
                onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <div className="flex justify-between">
                {touched.address && errors.address && <span className="field-error">{errors.address}</span>}
                <span className="text-[12px] text-ink/35 ml-auto font-mono">{form.address.length}/400</span>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="8–16 characters, 1 uppercase, 1 special character"
                value={form.password}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {touched.password && errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
