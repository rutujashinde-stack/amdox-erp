'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
}

export default function ApplyLeavePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState('SICK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchEmployees() {
      const token = localStorage.getItem('amdox_token');

      if (!token) {
        alert('Please log in first.');
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hr/employees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to load employees');
        }

        const data: Employee[] = await response.json();
        setEmployees(data);

        if (data.length > 0) {
          setEmployeeId(data[0].id);
        }
      } catch (error) {
        console.error('Employee loading failed:', error);
        alert('Could not load employees.');
      } finally {
        setLoadingEmployees(false);
      }
    }

    fetchEmployees();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('amdox_token');

    if (!token) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    if (!employeeId) {
      alert('Please select an employee.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hr/leaves`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId,
            type,
            startDate,
            endDate,
            reason,
          }),
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Failed to apply leave');
      }

      alert('Leave request submitted successfully!');
      router.push('/hr/leaves');
    } catch (error) {
      console.error('Leave request failed:', error);

      alert(
        error instanceof Error
          ? `Failed to apply leave: ${error.message}`
          : 'Failed to apply leave',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Apply Leave</h1>

      <p className="mt-2 text-gray-600">
        Submit a leave request for an employee.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <select
            className="rounded-lg border p-3"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={loadingEmployees}
            required
          >
            <option value="">
              {loadingEmployees ? 'Loading employees...' : 'Select Employee'}
            </option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeCode} - {employee.firstName}{' '}
                {employee.lastName}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border p-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="ANNUAL">Annual Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="MATERNITY">Maternity Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>

          <input
            className="rounded-lg border p-3"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <textarea
            className="rounded-lg border p-3 md:col-span-2"
            placeholder="Reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        {employees.length === 0 && !loadingEmployees && (
          <p className="mt-4 text-sm text-red-600">
            Add at least one employee before applying for leave.
          </p>
        )}

        <button
          type="submit"
          disabled={saving || loadingEmployees || employees.length === 0}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>
    </section>
  );
}