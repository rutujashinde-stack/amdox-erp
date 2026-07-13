'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorderPoint: number;
  unitPrice: number | string;
}

interface DashboardData {
  totalVendors?: number;
  totalPurchaseOrders?: number;
  totalInventoryItems?: number;
  lowStockItems?: number;
}

export default function SupplyChainPage() {
  const [dashboard, setDashboard] = useState<DashboardData>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSupplyChainData() {
      try {
        const [dashboardResponse, inventoryResponse] = await Promise.all([
          api.get('/supply-chain/dashboard'),
          api.get('/supply-chain/inventory'),
        ]);

        setDashboard(dashboardResponse.data);
        setInventory(inventoryResponse.data);
      } catch (err) {
        console.error('Supply chain dashboard error:', err);
        setError('Could not load supply chain dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadSupplyChainData();
  }, []);

  const lowStockCount = inventory.filter(
    (item) => item.quantity <= item.reorderPoint,
  ).length;

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Supply Chain Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Manage inventory, suppliers, purchase orders and stock levels.
      </p>

      {loading && (
        <p className="mt-8 text-gray-500">
          Loading supply chain data...
        </p>
      )}

      {error && (
        <p className="mt-8 text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-gray-500">Inventory Items</p>
              <h2 className="mt-2 text-3xl font-bold">
                {dashboard.totalInventoryItems ?? inventory.length}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-gray-500">Suppliers</p>
              <h2 className="mt-2 text-3xl font-bold">
                {dashboard.totalVendors ?? 0}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-gray-500">Purchase Orders</p>
              <h2 className="mt-2 text-3xl font-bold">
                {dashboard.totalPurchaseOrders ?? 0}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-5 shadow">
              <p className="text-gray-500">Low Stock</p>
              <h2 className="mt-2 text-3xl font-bold text-red-600">
                {dashboard.lowStockItems ?? lowStockCount}
              </h2>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-semibold">
              Inventory Overview
            </h2>

            {inventory.length === 0 ? (
              <p className="text-center text-gray-500">
                No inventory items found.
              </p>
            ) : (
              <table className="w-full border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-3">SKU</th>
                    <th className="border p-3">Product</th>
                    <th className="border p-3">Stock</th>
                    <th className="border p-3">Reorder Point</th>
                    <th className="border p-3">Price</th>
                    <th className="border p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.slice(0, 5).map((item) => {
                    const isLowStock =
                      item.quantity <= item.reorderPoint;

                    return (
                      <tr key={item.id}>
                        <td className="border p-3">{item.sku}</td>
                        <td className="border p-3">{item.name}</td>
                        <td className="border p-3">{item.quantity}</td>
                        <td className="border p-3">
                          {item.reorderPoint}
                        </td>
                        <td className="border p-3">
                          ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`border p-3 font-semibold ${
                            isLowStock
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {isLowStock ? 'Low Stock' : 'Available'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}