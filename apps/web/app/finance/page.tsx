'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function FinancePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/finance/dashboard')
      .then((res) => {
        console.log('Finance Dashboard:', res.data);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Finance Dashboard</h1>

          <p className="mt-2 text-gray-600">
            Live finance data from backend.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/finance/add-account"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            + Add Account
          </Link>

          <Link
            href="/finance/add-transaction"
            className="rounded-lg bg-slate-800 px-5 py-3 text-white hover:bg-slate-900"
          >
            + Add Transaction
          </Link>

          <Link
            href="/finance/transactions"
            className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
          >
            View Transactions
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            ₹{Number(data?.totalAssets ?? 0).toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Total Liabilities</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            ₹{Number(data?.totalLiabilities ?? 0).toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Net Worth</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            ₹{Number(data?.netWorth ?? 0).toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Transactions</p>
          <h2 className="mt-2 text-3xl font-bold">
            {data?.totalTransactions ?? 0}
          </h2>
        </div>
      </div>
    </section>
  );
}