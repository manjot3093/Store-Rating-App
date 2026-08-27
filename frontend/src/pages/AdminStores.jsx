import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import SortHeader from '../components/SortHeader';
import StarRating from '../components/StarRating';
import AddStoreModal from './AddStoreModal';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/stores', { params: { ...filters, sortBy, order } });
      setStores(data.stores);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 250);
    return () => clearTimeout(t);
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <Layout>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="eyebrow mb-1.5">Registry</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Stores</h1>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Add store
        </button>
      </div>

      <div className="card p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          className="field-input !py-2"
          placeholder="Filter by name…"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          className="field-input !py-2"
          placeholder="Filter by email…"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          className="field-input !py-2"
          placeholder="Filter by address…"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-ink/10 bg-ink/[0.02]">
              <tr>
                <SortHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
                <SortHeader label="Email" field="email" sortBy={sortBy} order={order} onSort={handleSort} />
                <SortHeader label="Address" field="address" sortBy={sortBy} order={order} onSort={handleSort} />
                <SortHeader label="Rating" field="rating" sortBy={sortBy} order={order} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {stores.map((s) => (
                <tr key={s.id} className="hover:bg-ink/[0.015] transition-colors">
                  <td className="td-cell font-semibold text-ink">{s.name}</td>
                  <td className="td-cell text-ink/60">{s.email}</td>
                  <td className="td-cell text-ink/60 max-w-xs truncate">{s.address}</td>
                  <td className="td-cell">
                    <StarRating value={s.rating} count={s.ratingCount} />
                  </td>
                </tr>
              ))}
              {!loading && stores.length === 0 && (
                <tr>
                  <td colSpan={4} className="td-cell text-center text-ink/40 py-10">
                    No stores match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-[13px] text-ink/50 font-mono">{stores.length} total</div>

      <AddStoreModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchStores} />
    </Layout>
  );
}
