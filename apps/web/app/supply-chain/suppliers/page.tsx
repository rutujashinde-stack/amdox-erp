'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../../../lib/api";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function SuppliersPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await api.get("/supply-chain/vendors");
        setVendors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Suppliers Management</h1>
          <p className="mt-2 text-gray-600">
            Live supplier data from backend.
          </p>
        </div>

        <Link
          href="/supply-chain/add-supplier"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Supplier
        </Link>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        {loading ? (
          <p className="text-center text-gray-500">
            Loading suppliers...
          </p>
        ) : vendors.length === 0 ? (
          <p className="text-center text-gray-500">
            No suppliers found.
          </p>
        ) : (
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
                  <td className="border p-3">
                    {vendor.id.slice(0, 8)}
                  </td>
                  <td className="border p-3">{vendor.name}</td>
                  <td className="border p-3">{vendor.email}</td>
                  <td className="border p-3">{vendor.phone}</td>
                  <td className="border p-3">{vendor.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}