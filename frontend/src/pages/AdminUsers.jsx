import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import SortHeader from '../components/SortHeader';
import AddUserModal from './AddUserModal';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

const ROLE_BADGE = {
  admin: 'bg-ink text-white',
  user: 'bg-brand-50 text-brand-700',
  store_owner: 'bg-clay-500/10 text-clay-600',
};
const ROLE_LABEL = { admin: 'Admin', user: 'Normal User', store_owner: 'Store Owner' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, sortBy, order };
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250); // debounce filter typing
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const roleCounts = useMemo(() => {
    return users.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] || 0) + 1 }), {});
  }, [users]);

  return (
    <Layout>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="eyebrow mb-1.5">Registry</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Users &amp; administrators</h1>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Add user
        </button>
      </div>

      <div className="card p-4 mb-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
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
        <select
          className="field-input !py-2"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">Normal User</option>
          <option value="store_owner">Store Owner</option>
        </select>
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
                <SortHeader label="Role" field="role" sortBy={sortBy} order={order} onSort={handleSort} />
                <th className="th-cell">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-ink/[0.015] transition-colors">
                  <td className="td-cell font-semibold text-ink">
                    <Link to={`/admin/users/${u.id}`} className="hover:text-brand-600">
                      {u.name}
                    </Link>
                  </td>
                  <td className="td-cell text-ink/60">{u.email}</td>
                  <td className="td-cell text-ink/60 max-w-xs truncate">{u.address}</td>
                  <td className="td-cell">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_BADGE[u.role]}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="td-cell font-mono text-[13px]">
                    {u.role === 'store_owner' ? (u.rating != null ? `${u.rating} ★` : '—') : '—'}
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-cell text-center text-ink/40 py-10">
                    No users match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4 mt-4 text-[13px] text-ink/50 font-mono">
        <span>{users.length} total</span>
        {Object.entries(roleCounts).map(([role, count]) => (
          <span key={role}>{ROLE_LABEL[role]}: {count}</span>
        ))}
      </div>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchUsers} />
    </Layout>
  );
}
