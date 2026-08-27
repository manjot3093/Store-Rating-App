import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import StarRating from '../components/StarRating';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

const ROLE_LABEL = { admin: 'System Administrator', user: 'Normal User', store_owner: 'Store Owner' };

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => setError(extractApiError(err)));
  }, [id]);

  return (
    <Layout>
      <Link to="/admin/users" className="eyebrow hover:text-ink mb-4 inline-block">← Back to users</Link>

      {error && <Alert type="error">{error}</Alert>}

      {user && (
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center font-display text-xl font-semibold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{user.name}</h1>
              <span className="eyebrow">{ROLE_LABEL[user.role]}</span>
            </div>
          </div>

          <div className="card p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <div className="text-ink/45 mb-0.5">Email</div>
              <div className="font-medium text-ink">{user.email}</div>
            </div>
            <div>
              <div className="text-ink/45 mb-0.5">Role</div>
              <div className="font-medium text-ink">{ROLE_LABEL[user.role]}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-ink/45 mb-0.5">Address</div>
              <div className="font-medium text-ink">{user.address}</div>
            </div>
            <div>
              <div className="text-ink/45 mb-0.5">Member since</div>
              <div className="font-medium text-ink">
                {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {user.role === 'store_owner' && (
              <div>
                <div className="text-ink/45 mb-0.5">Store rating</div>
                {user.store ? (
                  <div className="flex items-center gap-2">
                    <StarRating value={user.rating || 0} count={user.ratingCount} />
                  </div>
                ) : (
                  <div className="text-ink/40 italic">No store linked yet</div>
                )}
                {user.store && <div className="text-ink/50 text-[13px] mt-1">for {user.store.name}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
