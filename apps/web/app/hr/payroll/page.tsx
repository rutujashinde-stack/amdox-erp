'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface PayrollRecord {
  id: string;
  period: string;
  grossSalary: number | string;
  tax: number | string;
  deductions: number | string;
  netSalary: number | string;
  status: string;
  createdAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
}

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const response = await api.get('/hr/payroll');
        setRecords(response.data);
      } catch (err) {
        console.error('Payroll loading failed:', err);
        setError('Could not load payroll records.');
      } finally {
        setLoading(false);
      }
    }

    fetchPayroll();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Payroll Records</h1>

          <p className="mt-2 text-gray-600">
            View processed payroll records from the backend.
          </p>
        </div>

        <Link
          href="/hr/process-payroll"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          Process Payroll
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
        {loading && (
          <p className="text-center text-gray-500">Loading payroll...</p>
        )}

        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && records.length === 0 && (
          <p className="text-center text-gray-500">
            No payroll records found.
          </p>
        )}

        {!loading && !error && records.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">Employee Code</th>
                <th className="border p-3">Employee</th>
                <th className="border p-3">Period</th>
                <th className="border p-3">Gross Salary</th>
                <th className="border p-3">Tax</th>
                <th className="border p-3">Deductions</th>
                <th className="border p-3">Net Salary</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="border p-3">
                    {record.employee?.employeeCode ?? '-'}
                  </td>

                  <td className="border p-3">
                    {record.employee
                      ? `${record.employee.firstName} ${record.employee.lastName}`
                      : '-'}
                  </td>

                  <td className="border p-3">{record.period}</td>

                  <td className="border p-3">
                    ₹{Number(record.grossSalary).toLocaleString('en-IN')}
                  </td>

                  <td className="border p-3">
                    ₹{Number(record.tax).toLocaleString('en-IN')}
                  </td>

                  <td className="border p-3">
                    ₹{Number(record.deductions).toLocaleString('en-IN')}
                  </td>

                  <td className="border p-3 font-semibold">
                    ₹{Number(record.netSalary).toLocaleString('en-IN')}
                  </td>

                  <td className="border p-3 text-green-600">
                    {record.status}
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
