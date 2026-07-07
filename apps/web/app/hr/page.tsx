'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function HrPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/hr/dashboard')
      .then((res) => {
        console.log('HR Dashboard:', res.data);
        setData(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">HR & Payroll Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Live HR data from backend.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Employees</p>
          <h2 className="mt-2 text-3xl font-bold">
            {data?.totalEmployees ?? 0}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Payroll Records</p>
          <h2 className="mt-2 text-3xl font-bold">
            {data?.totalPayrolls ?? 0}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Pending Leaves</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {data?.pendingLeaves ?? 0}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Approved Leaves</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {data?.approvedLeaves ?? 0}
          </h2>
        </div>
      </div>
    </section>
  );
}