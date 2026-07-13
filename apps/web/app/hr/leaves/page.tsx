'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface LeaveRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  employee?: {
    employeeCode: string;
    firstName: string;
    lastName: string;
  };
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const response = await api.get('/hr/leaves');
        setLeaves(response.data);
      } catch (err) {
        console.error('Leave loading failed:', err);
        setError('Could not load leave requests.');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaves();
  }, []);

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Leave Requests</h1>

          <p className="mt-2 text-gray-600">
            View all employee leave requests.
          </p>
        </div>

        <Link
          href="/hr/apply-leave"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Apply Leave
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
        {loading && (
          <p className="text-center text-gray-500">
            Loading leave requests...
          </p>
        )}

        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && leaves.length === 0 && (
          <p className="text-center text-gray-500">
            No leave requests found.
          </p>
        )}

        {!loading && !error && leaves.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">Employee Code</th>
                <th className="border p-3">Employee</th>
                <th className="border p-3">Leave Type</th>
                <th className="border p-3">Start Date</th>
                <th className="border p-3">End Date</th>
                <th className="border p-3">Reason</th>
                <th className="border p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="border p-3">
                    {leave.employee?.employeeCode ?? '-'}
                  </td>

                  <td className="border p-3">
                    {leave.employee
                      ? `${leave.employee.firstName} ${leave.employee.lastName}`
                      : '-'}
                  </td>

                  <td className="border p-3">{leave.type}</td>

                  <td className="border p-3">
                    {new Date(leave.startDate).toLocaleDateString('en-IN')}
                  </td>

                  <td className="border p-3">
                    {new Date(leave.endDate).toLocaleDateString('en-IN')}
                  </td>

                  <td className="border p-3">{leave.reason || '-'}</td>

                  <td
                    className={`border p-3 font-semibold ${
                      leave.status === 'APPROVED'
                        ? 'text-green-600'
                        : leave.status === 'REJECTED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {leave.status}
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