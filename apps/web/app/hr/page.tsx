'use client';

import Link from 'next/link';
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">HR & Payroll Dashboard</h1>

          <p className="mt-2 text-gray-600">
            Live HR data from backend.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/hr/add-employee"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            + Add Employee
          </Link>

          <Link
            href="/hr/employees"
            className="rounded-lg bg-cyan-600 px-5 py-3 text-white hover:bg-cyan-700"
          >
            View Employees
          </Link>

          <Link
            href="/hr/process-payroll"
            className="rounded-lg bg-slate-800 px-5 py-3 text-white hover:bg-slate-900"
          >
            Process Payroll
          </Link>

          <Link
            href="/hr/payroll"
            className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
          >
            View Payroll
          </Link>

          <Link
            href="/hr/apply-leave"
            className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
          >
            + Apply Leave
          </Link>

          <Link
            href="/hr/leaves"
            className="rounded-lg bg-orange-600 px-5 py-3 text-white hover:bg-orange-700"
          >
            View Leaves
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
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