'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  const loadProducts = () => {
    api
      .get('/supply-chain/inventory')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/supply-chain/inventory/${id}`);
      loadProducts();
      alert('Product deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const handleEdit = async (item: any) => {
    const name = prompt('Product Name', item.name);
    if (name === null) return;

    const quantity = prompt('Quantity', String(item.quantity));
    if (quantity === null) return;

    const unitPrice = prompt('Unit Price', String(item.unitPrice));
    if (unitPrice === null) return;

    const reorderPoint = prompt('Reorder Point', String(item.reorderPoint));
    if (reorderPoint === null) return;

    try {
      await api.patch(`/supply-chain/inventory/${item.id}`, {
        name,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        reorderPoint: Number(reorderPoint),
      });

      loadProducts();
      alert('Product updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update product.');
    }
  };

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Products</h1>
      <p className="mt-2 text-gray-600">Live inventory products from backend.</p>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3">SKU</th>
              <th className="border p-3">Name</th>
              <th className="border p-3">Price</th>
              <th className="border p-3">Stock</th>
              <th className="border p-3">Reorder Point</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td className="border p-3">{item.sku}</td>
                <td className="border p-3">{item.name}</td>
                <td className="border p-3">₹{item.unitPrice}</td>
                <td className="border p-3">{item.quantity}</td>
                <td className="border p-3">{item.reorderPoint}</td>
                <td
                  className={`border p-3 ${
                    item.quantity <= item.reorderPoint
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {item.quantity <= item.reorderPoint ? 'Low Stock' : 'Available'}
                </td>
                <td className="border p-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="mr-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="py-6 text-center text-gray-500">No products found.</p>
        )}
      </div>
    </section>
  );
}