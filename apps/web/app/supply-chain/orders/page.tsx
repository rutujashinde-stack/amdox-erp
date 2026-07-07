'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/supply-chain/purchase-orders')
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Purchase Orders</h1>

      <p className="mt-2 text-gray-600">
        Live purchase orders from backend.
      </p>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
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
                  {order.items?.map((item: any) => item.productName).join(', ')}
                </td>

                <td className="border p-3">
                  ₹{Number(order.totalAmount).toLocaleString()}
                </td>

                <td className="border p-3">
                  {new Date(order.createdAt).toLocaleDateString()}
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

        {orders.length === 0 && (
          <div className="py-6 text-center text-gray-500">
            No purchase orders found.
          </div>
        )}
      </div>
    </section>
  );
}