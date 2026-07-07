'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function SuppliersPage() {
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/supply-chain/vendors')
      .then((res) => setVendors(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Suppliers Management</h1>
      <p className="mt-2 text-gray-600">Live supplier data from backend.</p>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3">Supplier ID</th>
              <th className="border p-3">Name</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Address</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td className="border p-3">{vendor.id.slice(0, 8)}</td>
                <td className="border p-3">{vendor.name}</td>
                <td className="border p-3">{vendor.email}</td>
                <td className="border p-3">{vendor.phone}</td>
                <td className="border p-3">{vendor.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}