'use client';

import Link from 'next/link';
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
        setError('');

        const [dashboardResponse, inventoryResponse] = await Promise.all([
          api.get('/supply-chain/dashboard'),
          api.get('/supply-chain/inventory'),
        ]);

        setDashboard(dashboardResponse.data ?? {});
        setInventory(
          Array.isArray(inventoryResponse.data)
            ? inventoryResponse.data
            : [],
        );
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
    (item) =>
      Number(item.quantity) <= Number(item.reorderPoint),
  ).length;

  return (
    <section className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Supply Chain Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Manage inventory, suppliers, purchase orders and stock levels.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/supply-chain/products"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
          >
            View Products
          </Link>

          <Link
            href="/supply-chain/add-product"
            className="rounded-lg bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
          >
            + Add Product
          </Link>

          <Link
            href="/supply-chain/suppliers"
            className="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
          >
            View Suppliers
          </Link>

          <Link
            href="/supply-chain/add-supplier"
            className="rounded-lg bg-emerald-700 px-5 py-3 text-white transition hover:bg-emerald-800"
          >
            + Add Supplier
          </Link>

          <Link
            href="/supply-chain/orders"
            className="rounded-lg bg-purple-600 px-5 py-3 text-white transition hover:bg-purple-700"
          >
            View Orders
          </Link>

          <Link
            href="/supply-chain/add-order"
            className="rounded-lg bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700"
          >
            + Create Order
          </Link>
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-gray-500">
          Loading supply chain data...
        </p>
      )}

      {error && (
        <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/supply-chain/products"
              className="rounded-xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-gray-500">Inventory Items</p>

              <h2 className="mt-2 text-3xl font-bold">
                {dashboard.totalInventoryItems ?? inventory.length}
              </h2>

              <p className="mt-3 text-sm text-blue-600">
                View products →
              </p>
            </Link>

            <Link
              href="/supply-chain/suppliers"
              className="rounded-xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-gray-500">Suppliers</p>

              <h2 className="mt-2 text-3xl font-bold">
                {dashboard.totalVendors ?? 0}
              </h2>

              <p className="mt-3 text-sm text-green-600">
                View suppliers →
              </p>
            </Link>

            <Link
              href="/supply-chain/orders"
              className="rounded-xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-gray-500">Purchase Orders</p>

              <h2 className="mt-2 text-3xl font-bold">
                {dashboard.totalPurchaseOrders ?? 0}
              </h2>

              <p className="mt-3 text-sm text-purple-600">
                View orders →
              </p>
            </Link>

            <Link
              href="/supply-chain/products"
              className="rounded-xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-gray-500">Low Stock</p>

              <h2 className="mt-2 text-3xl font-bold text-red-600">
                {dashboard.lowStockItems ?? lowStockCount}
              </h2>

              <p className="mt-3 text-sm text-red-600">
                Check low-stock products →
              </p>
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">
                Inventory Overview
              </h2>

              <Link
                href="/supply-chain/products"
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
              >
                View All Products
              </Link>
            </div>

            {inventory.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  No inventory items found.
                </p>

                <Link
                  href="/supply-chain/add-product"
                  className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
                >
                  Add First Product
                </Link>
              </div>
            ) : (
              <table className="w-full min-w-[800px] border-collapse">
                <thead className="bg-gray-100 text-left">
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
                      Number(item.quantity) <=
                      Number(item.reorderPoint);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="border p-3 font-medium">
                          {item.sku || '-'}
                        </td>

                        <td className="border p-3">
                          {item.name || '-'}
                        </td>

                        <td className="border p-3">
                          {item.quantity}
                        </td>

                        <td className="border p-3">
                          {item.reorderPoint}
                        </td>

                        <td className="border p-3">
                          ₹
                          {Number(item.unitPrice).toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>

                        <td className="border p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              isLowStock
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isLowStock
                              ? 'Low Stock'
                              : 'Available'}
                          </span>
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