'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setError('');

        const response = await api.get('/finance/transactions');

        setTransactions(
          Array.isArray(response.data) ? response.data : [],
        );
      } catch (err) {
        console.error('Transaction loading failed:', err);
        setError('Could not load transactions. Please log in again.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      const line = transaction.lines?.[0];

      const debitAccount = line?.debitAccount
        ? `${line.debitAccount.code} ${line.debitAccount.name}`
        : '';

      const creditAccount = line?.creditAccount
        ? `${line.creditAccount.code} ${line.creditAccount.name}`
        : '';

      return (
        transaction.reference?.toLowerCase().includes(query) ||
        transaction.description?.toLowerCase().includes(query) ||
        debitAccount.toLowerCase().includes(query) ||
        creditAccount.toLowerCase().includes(query) ||
        line?.currency?.toLowerCase().includes(query)
      );
    });
  }, [transactions, search]);

  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      window.alert('No transaction data available to export.');
      return;
    }

    const headers = [
      'Reference',
      'Description',
      'Date',
      'Debit Account',
      'Credit Account',
      'Amount',
      'Currency',
    ];

    const rows = filteredTransactions.map((transaction) => {
      const line = transaction.lines?.[0];

      const debitAccount = line?.debitAccount
        ? `${line.debitAccount.code} - ${line.debitAccount.name}`
        : '';

      const creditAccount = line?.creditAccount
        ? `${line.creditAccount.code} - ${line.creditAccount.name}`
        : '';

      return [
        transaction.reference ?? '',
        transaction.description ?? '',
        transaction.date
          ? new Date(transaction.date).toLocaleDateString('en-IN')
          : '',
        debitAccount,
        creditAccount,
        line?.amount ?? '',
        line?.currency ?? '',
      ];
    });

    const escapeCsvValue = (
      value: string | number | undefined,
    ) => {
      const text = String(value ?? '').replace(/"/g, '""');
      return `"${text}"`;
    };

    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) =>
        row.map((value) => escapeCsvValue(value)).join(','),
      ),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `transactions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <section className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Transactions</h1>

          <p className="mt-2 text-gray-600">
            View, search and export all finance transactions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportTransactions}
            disabled={filteredTransactions.length === 0}
            className="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export Transactions
          </button>

          <Link
            href="/finance/add-transaction"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
          >
            + Add Transaction
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by reference, description, account or currency..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-700 md:max-w-xl"
          />

          <p className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of{' '}
            {transactions.length} transactions
          </p>
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-500">
            Loading transactions...
          </p>
        )}

        {error && (
          <p className="py-10 text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && transactions.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No transactions found.
          </p>
        )}

        {!loading &&
          !error &&
          transactions.length > 0 &&
          filteredTransactions.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              No transactions match your search.
            </p>
          )}

        {!loading &&
          !error &&
          filteredTransactions.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead className="bg-gray-100 text-left">
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
                  {filteredTransactions.map((transaction) => {
                    const line = transaction.lines?.[0];

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="border p-3 font-medium">
                          {transaction.reference || '-'}
                        </td>

                        <td className="border p-3">
                          {transaction.description || '-'}
                        </td>

                        <td className="border p-3">
                          {transaction.date
                            ? new Date(
                                transaction.date,
                              ).toLocaleDateString('en-IN')
                            : '-'}
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
                          ₹
                          {Number(
                            line?.amount ?? 0,
                          ).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td className="border p-3">
                          {line?.currency ?? '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}