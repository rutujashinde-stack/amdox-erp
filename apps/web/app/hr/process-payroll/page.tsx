'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessPayrollPage() {
  const [period, setPeriod] = useState('');
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('amdox_token');

    if (!token) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    if (!period) {
      alert('Please select a payroll period.');
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hr/payroll/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            period,
          }),
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Failed to process payroll');
      }

      alert('Payroll processed successfully!');
      router.push('/hr/payroll');
    } catch (error) {
      console.error('Payroll processing failed:', error);

      alert(
        error instanceof Error
          ? `Failed to process payroll: ${error.message}`
          : 'Failed to process payroll',
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Process Payroll</h1>

      <p className="mt-2 text-gray-600">
        Process payroll for all active employees.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl rounded-xl bg-white p-6 shadow"
      >
        <label className="block text-sm font-medium text-gray-700">
          Payroll Period
        </label>

        <input
          className="mt-2 w-full rounded-lg border p-3"
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={processing}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? 'Processing...' : 'Process Payroll'}
        </button>
      </form>
    </section>
  );
}
