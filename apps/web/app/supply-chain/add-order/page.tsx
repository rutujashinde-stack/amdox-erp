'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  name: string;
}

export default function AddOrderPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchVendors() {
      const token = localStorage.getItem('amdox_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/supply-chain/vendors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load suppliers');
        }

        const data = await response.json();
        setVendors(data);

        if (data.length > 0) {
          setVendorId(data[0].id);
        }
      } catch (error) {
        console.error(error);
        alert('Could not load suppliers.');
      }
    }

    fetchVendors();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem('amdox_token');

    if (!token) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    if (!vendorId) {
      alert('Please select a supplier.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supply-chain/purchase-orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vendorId,
            items: [
              {
                productName,
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create purchase order');
      }

      alert('Purchase order created successfully!');
      router.push('/supply-chain/orders');
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? `Failed to create order: ${error.message}`
          : 'Failed to create order'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Create Purchase Order</h1>

      <p className="mt-2 text-gray-600">
        Create an order for an existing supplier.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <select
            className="rounded-lg border p-3"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
          >
            <option value="">Select Supplier</option>

            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border p-3"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            type="number"
            min="0"
            placeholder="Unit Price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Creating...' : 'Create Purchase Order'}
        </button>
      </form>
    </section>
  );
}