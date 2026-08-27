import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

export default function AddStoreModal({ open, onClose, onCreated }) {
  const empty = { name: '', email: '', address: '', ownerId: '' };
  const [form, setForm] = useState(empty);
  const [owners, setOwners] = useState([]);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api
        .get('/admin/users', { params: { role: 'store_owner' } })
        .then((res) => setOwners(res.data.users))
        .catch(() => setOwners([]));
    }
  }, [open]);

  const close = () => {
    setForm(empty);
    setApiError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.address.trim()) {
      setApiError('Name, email, and address are all required.');
      return;
    }
    setApiError('');
    setLoading(true);
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || undefined });
      onCreated?.();
      close();
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add a new store">
      {apiError && (
        <div className="mb-4">
          <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Store name</label>
          <input
            className="field-input"
            maxLength={60}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Store email</label>
          <input
            type="email"
            className="field-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Address</label>
          <textarea
            rows={2}
            className="field-input resize-none"
            maxLength={400}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Link to a store owner (optional)</label>
          <select
            className="field-input"
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          >
            <option value="">No owner yet — link later</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
          <p className="text-[12px] text-ink/40 mt-1.5">
            Only store-owner accounts not yet linked to a store are shown here.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={close}>Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create store'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
