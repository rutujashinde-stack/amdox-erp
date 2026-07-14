'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPayroll() {
      try {
        setError('');

        const response = await api.get('/hr/payroll');

        setRecords(
          Array.isArray(response.data) ? response.data : [],
        );
      } catch (err) {
        console.error('Payroll loading failed:', err);
        setError('Could not load payroll records.');
      } finally {
        setLoading(false);
      }
    }

    fetchPayroll();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) => {
      const employeeName = record.employee
        ? `${record.employee.firstName} ${record.employee.lastName}`
        : '';

      return (
        employeeName.toLowerCase().includes(query) ||
        record.employee?.employeeCode
          ?.toLowerCase()
          .includes(query) ||
        record.period?.toLowerCase().includes(query) ||
        record.status?.toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const handleExportPayroll = () => {
    if (filteredRecords.length === 0) {
      window.alert('No payroll data available to export.');
      return;
    }

    const headers = [
      'Employee Code',
      'Employee Name',
      'Period',
      'Gross Salary',
      'Tax',
      'Deductions',
      'Net Salary',
      'Status',
      'Processed Date',
    ];

    const rows = filteredRecords.map((record) => [
      record.employee?.employeeCode ?? '',
      record.employee
        ? `${record.employee.firstName} ${record.employee.lastName}`
        : '',
      record.period ?? '',
      record.grossSalary ?? '',
      record.tax ?? '',
      record.deductions ?? '',
      record.netSalary ?? '',
      record.status ?? '',
      record.createdAt
        ? new Date(record.createdAt).toLocaleDateString('en-IN')
        : '',
    ]);

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
    link.download = `payroll-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number | string) =>
    `₹${Number(value ?? 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Payroll Records</h1>

          <p className="mt-2 text-gray-600">
            View, search and export processed payroll records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportPayroll}
            disabled={filteredRecords.length === 0}
            className="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export Payroll
          </button>

          <Link
            href="/hr/process-payroll"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
          >
            Process Payroll
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee, code, period or status..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-700 md:max-w-xl"
          />

          <p className="text-sm text-gray-500">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-500">
            Loading payroll...
          </p>
        )}

        {error && (
          <p className="py-10 text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && records.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No payroll records found.
          </p>
        )}

        {!loading &&
          !error &&
          records.length > 0 &&
          filteredRecords.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              No payroll records match your search.
            </p>
          )}

        {!loading &&
          !error &&
          filteredRecords.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border p-3">Employee Code</th>
                    <th className="border p-3">Employee</th>
                    <th className="border p-3">Period</th>
                    <th className="border p-3">Gross Salary</th>
                    <th className="border p-3">Tax</th>
                    <th className="border p-3">Deductions</th>
                    <th className="border p-3">Net Salary</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Processed Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="border p-3 font-medium">
                        {record.employee?.employeeCode ?? '-'}
                      </td>

                      <td className="border p-3">
                        {record.employee
                          ? `${record.employee.firstName} ${record.employee.lastName}`
                          : '-'}
                      </td>

                      <td className="border p-3">
                        {record.period || '-'}
                      </td>

                      <td className="border p-3">
                        {formatCurrency(record.grossSalary)}
                      </td>

                      <td className="border p-3">
                        {formatCurrency(record.tax)}
                      </td>

                      <td className="border p-3">
                        {formatCurrency(record.deductions)}
                      </td>

                      <td className="border p-3 font-semibold">
                        {formatCurrency(record.netSalary)}
                      </td>

                      <td className="border p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            record.status === 'PROCESSED' ||
                            record.status === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {record.status || 'UNKNOWN'}
                        </span>
                      </td>

                      <td className="border p-3">
                        {record.createdAt
                          ? new Date(
                              record.createdAt,
                            ).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}