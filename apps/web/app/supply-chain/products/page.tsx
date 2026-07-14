'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../lib/api';

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  quantity: number;
  reorderPoint: number;
  unitPrice: number | string;
}

type StockFilter = 'ALL' | 'AVAILABLE' | 'LOW_STOCK';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/supply-chain/inventory');

      setProducts(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (err) {
      console.error('Product loading error:', err);
      setError('Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const isLowStock =
        Number(product.quantity) <= Number(product.reorderPoint);

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      const matchesStockFilter =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW_STOCK' && isLowStock) ||
        (stockFilter === 'AVAILABLE' && !isLowStock);

      return matchesSearch && matchesStockFilter;
    });
  }, [products, search, stockFilter]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?',
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/supply-chain/inventory/${id}`);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id),
      );

      window.alert('Product deleted successfully.');
    } catch (err) {
      console.error('Product deletion error:', err);
      window.alert('Failed to delete product.');
    }
  };

  const handleEdit = async (item: Product) => {
    const name = window.prompt('Product Name', item.name);

    if (name === null || !name.trim()) {
      return;
    }

    const quantityInput = window.prompt(
      'Quantity',
      String(item.quantity),
    );

    if (quantityInput === null) {
      return;
    }

    const unitPriceInput = window.prompt(
      'Unit Price',
      String(item.unitPrice),
    );

    if (unitPriceInput === null) {
      return;
    }

    const reorderPointInput = window.prompt(
      'Reorder Point',
      String(item.reorderPoint),
    );

    if (reorderPointInput === null) {
      return;
    }

    const quantity = Number(quantityInput);
    const unitPrice = Number(unitPriceInput);
    const reorderPoint = Number(reorderPointInput);

    if (
      Number.isNaN(quantity) ||
      Number.isNaN(unitPrice) ||
      Number.isNaN(reorderPoint)
    ) {
      window.alert('Please enter valid numbers.');
      return;
    }

    if (quantity < 0 || unitPrice < 0 || reorderPoint < 0) {
      window.alert('Values cannot be negative.');
      return;
    }

    try {
      await api.patch(`/supply-chain/inventory/${item.id}`, {
        name: name.trim(),
        quantity,
        unitPrice,
        reorderPoint,
      });

      await loadProducts();

      window.alert('Product updated successfully.');
    } catch (err) {
      console.error('Product update error:', err);
      window.alert('Failed to update product.');
    }
  };

  return (
    <section className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Products</h1>

          <p className="mt-2 text-gray-600">
            View, search, update and manage inventory products.
          </p>
        </div>

        <Link
          href="/supply-chain/add-product"
          className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name, SKU or category..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-700 md:max-w-xl"
          />

          <select
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(event.target.value as StockFilter)
            }
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-slate-700"
          >
            <option value="ALL">All Stock</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </p>

        {loading && (
          <p className="py-10 text-center text-gray-500">
            Loading products...
          </p>
        )}

        {error && (
          <div className="py-10 text-center">
            <p className="text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadProducts}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-gray-500">No products found.</p>

            <Link
              href="/supply-chain/add-product"
              className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
            >
              Add First Product
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              No products match your search or filter.
            </p>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border p-3">SKU</th>
                    <th className="border p-3">Name</th>
                    <th className="border p-3">Category</th>
                    <th className="border p-3">Price</th>
                    <th className="border p-3">Stock</th>
                    <th className="border p-3">Reorder Point</th>
                    <th className="border p-3">Status</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((item) => {
                    const isLowStock =
                      Number(item.quantity) <=
                      Number(item.reorderPoint);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="border p-3 font-medium">
                          {item.sku || '-'}
                        </td>

                        <td className="border p-3">
                          {item.name || '-'}
                        </td>

                        <td className="border p-3">
                          {item.category || '-'}
                        </td>

                        <td className="border p-3">
                          ₹
                          {Number(item.unitPrice).toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>

                        <td className="border p-3">
                          {item.quantity}
                        </td>

                        <td className="border p-3">
                          {item.reorderPoint}
                        </td>

                        <td className="border p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              isLowStock
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isLowStock
                              ? 'Low Stock'
                              : 'Available'}
                          </span>
                        </td>

                        <td className="border p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="rounded bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-600"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}