'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

export default function AddTransactionPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchAccounts() {
      const token = localStorage.getItem('amdox_token');

      if (!token) {
        alert('Please log in first.');
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/finance/accounts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to load finance accounts');
        }

        const data: Account[] = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error('Account loading failed:', error);
        alert('Could not load finance accounts.');
      } finally {
        setLoadingAccounts(false);
      }
    }

    fetchAccounts();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem('amdox_token');

    if (!token) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    if (debitAccountId === creditAccountId) {
      alert('Debit and credit accounts must be different.');
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description,
            date,
            lines: [
              {
                debitAccountId,
                creditAccountId,
                amount: numericAmount,
                currency,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create transaction');
      }

      alert('Transaction created successfully!');
      router.push('/finance');
    } catch (error) {
      console.error('Transaction creation failed:', error);

      alert(
        error instanceof Error
          ? `Failed to create transaction: ${error.message}`
          : 'Failed to create transaction',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Add Transaction</h1>

      <p className="mt-2 text-gray-600">
        Create a debit and credit journal entry.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <input
            className="rounded-lg border p-3"
            placeholder="Transaction Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <select
            className="rounded-lg border p-3"
            value={debitAccountId}
            onChange={(e) => setDebitAccountId(e.target.value)}
            disabled={loadingAccounts}
            required
          >
            <option value="">
              {loadingAccounts ? 'Loading accounts...' : 'Select Debit Account'}
            </option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name} ({account.type})
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border p-3"
            value={creditAccountId}
            onChange={(e) => setCreditAccountId(e.target.value)}
            disabled={loadingAccounts}
            required
          >
            <option value="">
              {loadingAccounts
                ? 'Loading accounts...'
                : 'Select Credit Account'}
            </option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name} ({account.type})
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border p-3"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
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
        </div>

        {accounts.length < 2 && !loadingAccounts && (
          <p className="mt-4 text-sm text-red-600">
            Create at least two finance accounts before adding a transaction.
          </p>
        )}

        <button
          type="submit"
          disabled={saving || loadingAccounts || accounts.length < 2}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Creating...' : 'Save Transaction'}
        </button>
      </form>
    </section>
  );
}