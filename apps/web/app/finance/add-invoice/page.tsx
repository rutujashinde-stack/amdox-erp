'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddInvoicePage() {
  const [type, setType] = useState<'PAYABLE' | 'RECEIVABLE'>('RECEIVABLE');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('amdox_token');

    if (!token) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid invoice amount.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance/invoices`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            amount: numericAmount,
            currency,
            dueDate,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create invoice');
      }

      alert('Invoice created successfully!');
      router.push('/finance/invoices');
    } catch (error) {
      console.error('Invoice creation failed:', error);

      alert(
        error instanceof Error
          ? `Failed to create invoice: ${error.message}`
          : 'Failed to create invoice',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Create Invoice</h1>

      <p className="mt-2 text-gray-600">
        Add a payable or receivable invoice.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <select
            className="rounded-lg border p-3"
            value={type}
            onChange={(e) =>
              setType(e.target.value as 'PAYABLE' | 'RECEIVABLE')
            }
            required
          >
            <option value="RECEIVABLE">Receivable</option>
            <option value="PAYABLE">Payable</option>
          </select>

          <input
            className="rounded-lg border p-3"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Invoice Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select
            className="rounded-lg border p-3"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>

          <input
            className="rounded-lg border p-3"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
    </section>
  );
}