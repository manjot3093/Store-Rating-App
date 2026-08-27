import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import StarRating from '../components/StarRating';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/store-owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(extractApiError(err)));
  }, []);

  if (error) {
    return (
      <Layout>
        <Alert type="error">{error}</Alert>
      </Layout>
    );
  }

  if (!data) return <Layout><div className="eyebrow animate-pulse">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="eyebrow mb-1.5">{data.store.name}</div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Store performance</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="card p-6">
          <div className="eyebrow mb-2">Average rating</div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-semibold text-ink">
              {data.averageRating.toFixed(1)}
            </span>
            <StarRating value={data.averageRating} size="lg" />
          </div>
        </div>
        <div className="card p-6">
          <div className="eyebrow mb-2">Total ratings received</div>
          <div className="font-display text-4xl font-semibold text-ink">{data.totalRatings}</div>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Customers who rated your store</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-ink/10 bg-ink/[0.02]">
              <tr>
                <th className="th-cell">Name</th>
                <th className="th-cell">Email</th>
                <th className="th-cell">Address</th>
                <th className="th-cell">Rating</th>
                <th className="th-cell">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {data.raters.map((r) => (
                <tr key={r.ratingId} className="hover:bg-ink/[0.015]">
                  <td className="td-cell font-semibold text-ink">{r.user.name}</td>
                  <td className="td-cell text-ink/60">{r.user.email}</td>
                  <td className="td-cell text-ink/60 max-w-xs truncate">{r.user.address}</td>
                  <td className="td-cell"><StarRating value={r.rating} /></td>
                  <td className="td-cell font-mono text-[13px] text-ink/50">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data.raters.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-cell text-center text-ink/40 py-10">
                    No ratings yet. Once customers rate your store, they'll appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
