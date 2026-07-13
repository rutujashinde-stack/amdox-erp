'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorderPoint: number;
  unitPrice: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await api.get('/supply-chain/inventory');
        setItems(response.data);
      } catch (err) {
        console.error(err);
        setError('Could not load inventory. Please log in again.');
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Inventory Management</h1>
          <p className="mt-2 text-gray-600">
            Live inventory from the backend.
          </p>
        </div>

        <Link
          href="/supply-chain/add-product"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
        {loading && <p>Loading inventory...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-600">No products found.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">SKU</th>
                <th className="border p-3">Product Name</th>
                <th className="border p-3">Stock</th>
                <th className="border p-3">Reorder Point</th>
                <th className="border p-3">Price</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border p-3">{item.sku}</td>
                  <td className="border p-3">{item.name}</td>
                  <td className="border p-3">{item.quantity}</td>
                  <td className="border p-3">{item.reorderPoint}</td>
                  <td className="border p-3">₹{item.unitPrice}</td>
                  <td
                    className={`border p-3 ${
                      item.quantity <= item.reorderPoint
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {item.quantity <= item.reorderPoint
                      ? 'Low Stock'
                      : 'Available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}