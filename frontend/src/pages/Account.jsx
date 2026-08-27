import React, { useState } from 'react';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { validatePassword, extractApiError } from '../utils/validation';

export default function Account() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordError = form.newPassword ? validatePassword(form.newPassword) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', form);
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg">
        <div className="eyebrow mb-1.5">Account</div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-6">Your profile &amp; security</h1>

        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-ink/45 mb-0.5">Name</div>
              <div className="font-medium text-ink">{user?.name}</div>
            </div>
            <div>
              <div className="text-ink/45 mb-0.5">Email</div>
              <div className="font-medium text-ink">{user?.email}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-ink/45 mb-0.5">Address</div>
              <div className="font-medium text-ink">{user?.address}</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Change password</h2>

          {error && <div className="mb-4"><Alert type="error" onClose={() => setError('')}>{error}</Alert></div>}
          {success && <div className="mb-4"><Alert type="success" onClose={() => setSuccess('')}>{success}</Alert></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Current password</label>
              <input
                type="password"
                required
                className="field-input"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">New password</label>
              <input
                type="password"
                required
                className="field-input"
                placeholder="8–16 characters, 1 uppercase, 1 special character"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
