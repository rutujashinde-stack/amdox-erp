'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../../lib/api';

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    api.get('/supply-chain/dashboard').then((res) => setDashboard(res.data));
    api.get('/supply-chain/inventory/low-stock').then((res) => setLowStock(res.data));
  }, []);

  const chartData = [
    { name: 'Vendors', value: dashboard?.totalVendors ?? 0 },
    { name: 'Orders', value: dashboard?.totalOrders ?? 0 },
    { name: 'Inventory', value: dashboard?.totalInventoryItems ?? 0 },
    { name: 'Low Stock', value: dashboard?.lowStockAlerts ?? 0 },
  ];

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Supply Chain Reports</h1>
      <p className="mt-2 text-gray-600">
        Live stock reports, order summary, and low stock alerts.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">Vendors</h2>
          <p className="mt-2 text-3xl font-bold">{dashboard?.totalVendors ?? 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">Orders</h2>
          <p className="mt-2 text-3xl font-bold">{dashboard?.totalOrders ?? 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">Inventory Items</h2>
          <p className="mt-2 text-3xl font-bold">{dashboard?.totalInventoryItems ?? 0}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">Low Stock Alerts</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">{dashboard?.lowStockAlerts ?? 0}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Supply Chain Summary</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Low Stock Report</h2>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3">SKU</th>
              <th className="border p-3">Product</th>
              <th className="border p-3">Current Stock</th>
              <th className="border p-3">Reorder Point</th>
              <th className="border p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {lowStock.map((item) => (
              <tr key={item.id}>
                <td className="border p-3">{item.sku}</td>
                <td className="border p-3">{item.name}</td>
                <td className="border p-3 text-red-600">{item.quantity}</td>
                <td className="border p-3">{item.reorderPoint}</td>
                <td className="border p-3">Reorder Required</td>
              </tr>
            ))}
          </tbody>
        </table>

        {lowStock.length === 0 && (
          <p className="py-6 text-center text-gray-500">
            No low stock items.
          </p>
        )}
      </div>
    </section>
  );
}