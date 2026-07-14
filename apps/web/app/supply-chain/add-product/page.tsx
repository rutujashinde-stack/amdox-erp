'use client';

import { useState } from 'react';

export default function AddProductPage() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem('amdox_token');

    if (!token) {
      window.alert('Please log in first.');
      return;
    }

    if (
      !productName.trim() ||
      !category.trim() ||
      !price ||
      !stock
    ) {
      window.alert('Please fill in all required fields.');
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericStock) ||
      numericPrice < 0 ||
      numericStock < 0
    ) {
      window.alert('Price and stock must be valid positive numbers.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supply-chain/inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sku: `ITEM-${Date.now()}`,
            name: productName.trim(),
            category: category.trim(),
            supplier: supplier.trim() || undefined,
            quantity: numericStock,
            reorderPoint: 5,
            unitPrice: numericPrice,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || 'Failed to add product',
        );
      }

      window.alert('Product added successfully!');

      setProductName('');
      setCategory('');
      setSupplier('');
      setPrice('');
      setStock('');
    } catch (error) {
      console.error('Product creation failed:', error);

      window.alert(
        error instanceof Error
          ? `Failed to add product: ${error.message}`
          : 'Failed to add product.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Add Product</h1>

      <p className="mt-2 text-gray-600">
        Add a new product to your inventory.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product Name
            </label>

            <input
              className="w-full rounded-lg border p-3"
              placeholder="Enter product name"
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <input
              className="w-full rounded-lg border p-3"
              placeholder="Enter category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Supplier
            </label>

            <input
              className="w-full rounded-lg border p-3"
              placeholder="Enter supplier name"
              value={supplier}
              onChange={(event) =>
                setSupplier(event.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Price
            </label>

            <input
              className="w-full rounded-lg border p-3"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock Quantity
            </label>

            <input
              className="w-full rounded-lg border p-3"
              type="number"
              min="0"
              placeholder="Enter stock quantity"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </section>
  );
}