'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../lib/api';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  designation?: string;
  position?: string;
  jobTitle?: string;
  status?: string;
  salary?: number | string;
  startDate?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEmployees() {
      try {
        setError('');

        const response = await api.get('/hr/employees');

        setEmployees(
          Array.isArray(response.data) ? response.data : [],
        );
      } catch (err) {
        console.error('Employee loading error:', err);
        setError('Could not load employees.');
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();

      return (
        fullName.includes(query) ||
        employee.employeeCode?.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) ||
        employee.department?.toLowerCase().includes(query) ||
        employee.designation?.toLowerCase().includes(query) ||
        employee.position?.toLowerCase().includes(query) ||
        employee.jobTitle?.toLowerCase().includes(query)
      );
    });
  }, [employees, search]);

  const getDesignation = (employee: Employee) => {
    return (
      employee.designation ||
      employee.position ||
      employee.jobTitle ||
      '-'
    );
  };

  return (
    <section className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Employees</h1>

          <p className="mt-2 text-gray-600">
            View and search all employees in the HR module.
          </p>
        </div>

        <Link
          href="/hr/add-employee"
          className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
        >
          + Add Employee
        </Link>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, code, email, department or designation..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-700 md:max-w-xl"
          />

          <p className="text-sm text-gray-500">
            Showing {filteredEmployees.length} of {employees.length}
          </p>
        </div>

        {loading && (
          <p className="mt-8 text-center text-gray-500">
            Loading employees...
          </p>
        )}

        {error && (
          <p className="mt-8 text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && employees.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              No employees found.
            </p>

            <Link
              href="/hr/add-employee"
              className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
            >
              Add First Employee
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          employees.length > 0 &&
          filteredEmployees.length === 0 && (
            <p className="mt-8 text-center text-gray-500">
              No employees match your search.
            </p>
          )}

        {!loading &&
          !error &&
          filteredEmployees.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border p-3">Employee Code</th>
                    <th className="border p-3">Name</th>
                    <th className="border p-3">Email</th>
                    <th className="border p-3">Department</th>
                    <th className="border p-3">Designation</th>
                    <th className="border p-3">Salary</th>
                    <th className="border p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="border p-3 font-medium">
                        {employee.employeeCode || '-'}
                      </td>

                      <td className="border p-3">
                        {employee.firstName} {employee.lastName}
                      </td>

                      <td className="border p-3">
                        {employee.email || '-'}
                      </td>

                      <td className="border p-3">
                        {employee.department || '-'}
                      </td>

                      <td className="border p-3">
                        {getDesignation(employee)}
                      </td>

                      <td className="border p-3">
                        {employee.salary !== undefined &&
                        employee.salary !== null
                          ? `₹${Number(
                              employee.salary,
                            ).toLocaleString('en-IN')}`
                          : '-'}
                      </td>

                      <td className="border p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            employee.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {employee.status || 'UNKNOWN'}
                        </span>
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