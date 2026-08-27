import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import api from '../api/axios';
import { extractApiError } from '../utils/validation';

const ROLE_LABEL = { admin: 'Admins', user: 'Normal users', store_owner: 'Store owners' };
const COLORS = ['#2454e0', '#d1723f', '#161A23'];

const StatCard = ({ label, value, index }) => (
  <div className="card p-6 relative overflow-hidden">
    <div className="eyebrow mb-2">{label}</div>
    <div className="font-display text-4xl font-semibold text-ink">{value}</div>
    <span className="absolute -right-3 -bottom-4 font-mono text-[64px] font-bold text-ink/[0.03] select-none">
      {String(index).padStart(2, '0')}
    </span>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(extractApiError(err)));
  }, []);

  return (
    <Layout>
      <div className="eyebrow mb-1.5">Registry overview</div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Administrator dashboard</h1>

      {error && <Alert type="error">{error}</Alert>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <StatCard label="Total users" value={data.totalUsers} index={1} />
            <StatCard label="Total stores" value={data.totalStores} index={2} />
            <StatCard label="Total ratings submitted" value={data.totalRatings} index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-6 lg:col-span-1">
              <h2 className="font-display text-lg font-semibold mb-4">Users by role</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.usersByRole.map((r) => ({ name: ROLE_LABEL[r.role] || r.role, value: r.count }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {data.usersByRole.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-2 flex flex-col justify-center">
              <h2 className="font-display text-lg font-semibold mb-4">Quick actions</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href="/admin/users" className="btn-secondary justify-start">
                  → Manage users &amp; admins
                </a>
                <a href="/admin/stores" className="btn-secondary justify-start">
                  → Manage stores
                </a>
              </div>
              <p className="text-sm text-ink/55 mt-5 leading-relaxed">
                From here you can register new stores, promote normal users, onboard store owners,
                and audit every rating filed on the platform. Use the filters on the Users and
                Stores pages to search by name, email, address, or role.
              </p>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
