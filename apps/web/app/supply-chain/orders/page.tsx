'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface PurchaseOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  totalAmount: number | string;
  createdAt: string;
  status: string;
  vendor?: {
    name: string;
  };
  items?: PurchaseOrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.get('/supply-chain/purchase-orders');
        setOrders(response.data);
      } catch (err) {
        console.error(err);
        setError('Could not load purchase orders.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Purchase Orders</h1>
          <p className="mt-2 text-gray-600">
            Live purchase orders from the backend.
          </p>
        </div>

        <Link
          href="/supply-chain/add-order"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Create Purchase Order
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
        {loading && (
          <p className="text-center text-gray-500">
            Loading purchase orders...
          </p>
        )}

        {error && (
          <p className="text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-gray-500">
            No purchase orders found.
          </p>
        )}

        {!loading && !error && orders.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">PO Number</th>
                <th className="border p-3">Supplier</th>
                <th className="border p-3">Products</th>
                <th className="border p-3">Total Amount</th>
                <th className="border p-3">Created Date</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-3">{order.poNumber}</td>

                  <td className="border p-3">
                    {order.vendor?.name ?? '-'}
                  </td>

                  <td className="border p-3">
                    {order.items?.length
                      ? order.items
                          .map((item) => item.productName)
                          .join(', ')
                      : '-'}
                  </td>

                  <td className="border p-3">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </td>

                  <td className="border p-3">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>

                  <td
                    className={`border p-3 font-semibold ${
                      order.status === 'DRAFT'
                        ? 'text-yellow-600'
                        : order.status === 'APPROVED'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.status}
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