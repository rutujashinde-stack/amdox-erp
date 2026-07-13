'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddAccountPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('ASSET');
  const [balance, setBalance] = useState('');
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

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance/accounts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code,
            name,
            type,
            balance: Number(balance),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create account');
      }

      alert('Account created successfully!');
      router.push('/finance');
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? `Failed to create account: ${error.message}`
          : 'Failed to create account',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Add Finance Account</h1>

      <p className="mt-2 text-gray-600">
        Create a chart of accounts entry.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <input
            className="rounded-lg border p-3"
            placeholder="Account Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="rounded-lg border p-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
            <option value="EQUITY">Equity</option>
            <option value="REVENUE">Revenue</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <input
            className="rounded-lg border p-3"
            type="number"
            min="0"
            step="0.01"
            placeholder="Opening Balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Account'}
        </button>
      </form>
    </section>
  );
}