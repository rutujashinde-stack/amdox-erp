'use client';

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
      <h1 className="text-4xl font-bold">Finance Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Live finance data from backend.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            ₹{Number(data?.totalAssets ?? 0).toLocaleString()}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Total Liabilities</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            ₹{Number(data?.totalLiabilities ?? 0).toLocaleString()}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Net Worth</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            ₹{Number(data?.netWorth ?? 0).toLocaleString()}
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