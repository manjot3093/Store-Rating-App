import React, { useState } from 'react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { validateName, validateAddress, validateEmail, validatePassword, extractApiError } from '../utils/validation';
import api from '../api/axios';

const ROLES = [
  { value: 'user', label: 'Normal User' },
  { value: 'admin', label: 'System Administrator' },
  { value: 'store_owner', label: 'Store Owner' },
];

export default function AddUserModal({ open, onClose, onCreated }) {
  const empty = { name: '', email: '', address: '', password: '', role: 'user' };
  const [form, setForm] = useState(empty);
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

  const close = () => {
    setForm(empty);
    setTouched({});
    setApiError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, address: true, password: true });
    if (!isValid) return;
    setApiError('');
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      onCreated?.();
      close();
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add a new user">
      {apiError && (
        <div className="mb-4">
          <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="field-label">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors ${
                  form.role === r.value
                    ? 'bg-ink text-white border-ink'
                    : 'border-ink/15 text-ink/60 hover:bg-ink/5'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Full name</label>
          <input
            className="field-input"
            placeholder="20–60 characters"
            value={form.name}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div>
          <label className="field-label">Email address</label>
          <input
            type="email"
            className="field-input"
            value={form.email}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div>
          <label className="field-label">Address</label>
          <textarea
            rows={2}
            className="field-input resize-none"
            placeholder="Max 400 characters"
            value={form.address}
            onBlur={() => setTouched((t) => ({ ...t, address: true }))}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {touched.address && errors.address && <span className="field-error">{errors.address}</span>}
        </div>

        <div>
          <label className="field-label">Temporary password</label>
          <input
            type="password"
            className="field-input"
            placeholder="8–16 characters, 1 uppercase, 1 special character"
            value={form.password}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {touched.password && errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={close}>Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
