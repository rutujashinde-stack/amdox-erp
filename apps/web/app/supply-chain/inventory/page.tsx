'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/supply-chain/inventory')
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Inventory Management</h1>
          <p className="mt-2 text-gray-600">Live inventory from backend.</p>
        </div>

        <a href="/supply-chain/add-product" className="rounded-lg bg-blue-600 px-5 py-3 text-white">
          + Add Product
        </a>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
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
                    item.quantity <= item.reorderPoint ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {item.quantity <= item.reorderPoint ? 'Low Stock' : 'Available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}