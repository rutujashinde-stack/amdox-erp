'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface JournalLine {
  id: string;
  amount: number | string;
  currency: string;
  debitAccount?: {
    code: string;
    name: string;
  } | null;
  creditAccount?: {
    code: string;
    name: string;
  } | null;
}

interface Transaction {
  id: string;
  reference: string;
  description: string;
  date: string;
  createdAt: string;
  lines?: JournalLine[];
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await api.get('/finance/transactions');
        setTransactions(response.data);
      } catch (err) {
        console.error('Transaction loading failed:', err);
        setError('Could not load transactions. Please log in again.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Transactions</h1>
          <p className="mt-2 text-gray-600">
            View all finance transactions from the backend.
          </p>
        </div>

        <Link
          href="/finance/add-transaction"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Transaction
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
        {loading && (
          <p className="text-center text-gray-500">
            Loading transactions...
          </p>
        )}

        {error && (
          <p className="text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && transactions.length === 0 && (
          <p className="text-center text-gray-500">
            No transactions found.
          </p>
        )}

        {!loading && !error && transactions.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">Reference</th>
                <th className="border p-3">Description</th>
                <th className="border p-3">Date</th>
                <th className="border p-3">Debit Account</th>
                <th className="border p-3">Credit Account</th>
                <th className="border p-3">Amount</th>
                <th className="border p-3">Currency</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => {
                const line = transaction.lines?.[0];

                return (
                  <tr key={transaction.id}>
                    <td className="border p-3">
                      {transaction.reference}
                    </td>

                    <td className="border p-3">
                      {transaction.description}
                    </td>

                    <td className="border p-3">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>

                    <td className="border p-3">
                      {line?.debitAccount
                        ? `${line.debitAccount.code} - ${line.debitAccount.name}`
                        : '-'}
                    </td>

                    <td className="border p-3">
                      {line?.creditAccount
                        ? `${line.creditAccount.code} - ${line.creditAccount.name}`
                        : '-'}
                    </td>

                    <td className="border p-3">
                      ₹{Number(line?.amount ?? 0).toLocaleString('en-IN')}
                    </td>

                    <td className="border p-3">
                      {line?.currency ?? '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}