'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function SupplyChainPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/supply-chain/dashboard')
      .then((res) => {
        console.log('Dashboard Response:', res.data);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="p-8">
        <h1 className="text-4xl font-bold">Supply Chain Dashboard</h1>

        <p className="mt-2 text-gray-600">
          Live data from backend API.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">Total Products</p>
            <h2 className="mt-2 text-3xl font-bold">
              {data?.totalInventoryItems ?? 0}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">Suppliers</p>
            <h2 className="mt-2 text-3xl font-bold">
              {data?.totalVendors ?? 0}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">Purchase Orders</p>
            <h2 className="mt-2 text-3xl font-bold">
              {data?.totalOrders ?? 0}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-gray-500">Low Stock</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {data?.lowStockAlerts ?? 0}
            </h2>
          </div>
        </div>
      </section>
    </main>
  );
}