import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import StarRating from '../components/StarRating';
import StarInput from '../components/StarInput';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/stores', { params: { ...filters, sortBy, order: 'asc' } });
      setStores(data.stores);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 250);
    return () => clearTimeout(t);
  }, [fetchStores]);

  const handleRate = async (storeId, rating) => {
    try {
      await api.post(`/stores/${storeId}/ratings`, { rating });
      setStores((prev) =>
        prev.map((s) => {
          if (s.id !== storeId) return s;
          const wasRated = s.userRating != null;
          const oldTotal = (s.rating || 0) * (s.ratingCount || 0);
          const newCount = wasRated ? s.ratingCount : s.ratingCount + 1;
          const newTotal = wasRated ? oldTotal - s.userRating + rating : oldTotal + rating;
          return { ...s, userRating: rating, ratingCount: newCount, rating: newTotal / newCount };
        })
      );
      setToast(`Rating saved — thanks for the feedback!`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  return (
    <Layout>
      <div className="eyebrow mb-1.5">Discover</div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Browse &amp; rate stores</h1>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          className="field-input !py-2 flex-1"
          placeholder="Search by store name…"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          className="field-input !py-2 flex-1"
          placeholder="Search by address…"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <select
          className="field-input !py-2 sm:w-48"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="rating">Sort: Overall rating</option>
          <option value="userRating">Sort: My rating</option>
        </select>
      </div>

      {toast && (
        <div className="mb-4">
          <Alert type="success" onClose={() => setToast('')}>{toast}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert type="error" onClose={() => setError('')}>{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stores.map((s) => (
          <div key={s.id} className="card p-5 flex flex-col gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{s.name}</h3>
              <p className="text-sm text-ink/55 mt-0.5">{s.address}</p>
            </div>

            <div className="flex items-center justify-between border-t border-ink/10 pt-3">
              <div>
                <div className="eyebrow mb-1">Overall rating</div>
                <StarRating value={s.rating} count={s.ratingCount} />
              </div>
              <div className="text-right">
                <div className="eyebrow mb-1">{s.userRating ? 'Your rating' : 'Rate this store'}</div>
                <StarInput value={s.userRating} onSubmit={(rating) => handleRate(s.id, rating)} />
              </div>
            </div>
          </div>
        ))}

        {!loading && stores.length === 0 && (
          <div className="card p-10 text-center text-ink/40 sm:col-span-2">
            No stores match your search.
          </div>
        )}
      </div>
    </Layout>
  );
}
