'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Invoice {
  id: string;
  number: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  amount: number | string;
  currency: string;
  dueDate: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await api.get('/finance/invoices');
        setInvoices(response.data);
      } catch (err) {
        console.error('Invoice loading failed:', err);
        setError('Could not load invoices. Please log in again.');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Invoices</h1>
          <p className="mt-2 text-gray-600">
            View all finance invoices from the backend.
          </p>
        </div>

        <Link
          href="/finance/add-invoice"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Create Invoice
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
        {loading && (
          <p className="text-center text-gray-500">Loading invoices...</p>
        )}

        {error && (
          <p className="text-center text-red-600">{error}</p>
        )}

        {!loading && !error && invoices.length === 0 && (
          <p className="text-center text-gray-500">
            No invoices found.
          </p>
        )}

        {!loading && !error && invoices.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">Invoice Number</th>
                <th className="border p-3">Type</th>
                <th className="border p-3">Amount</th>
                <th className="border p-3">Currency</th>
                <th className="border p-3">Due Date</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="border p-3">{invoice.number}</td>
                  <td className="border p-3">{invoice.type}</td>
                  <td className="border p-3">
                    {invoice.currency === 'INR' ? '₹' : ''}
                    {Number(invoice.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="border p-3">{invoice.currency}</td>
                  <td className="border p-3">
                    {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                  </td>
                  <td
                    className={`border p-3 font-semibold ${
                      invoice.status === 'PAID'
                        ? 'text-green-600'
                        : invoice.status === 'OVERDUE'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {invoice.status}
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