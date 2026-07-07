"use client";

import { useState } from "react";

export default function AddProductPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    alert(
      `Product Added Successfully!\n\nName: ${productName}\nCategory: ${category}\nSupplier: ${supplier}\nPrice: ₹${price}\nStock: ${stock}`
    );
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Add Product</h1>
      <p className="mt-2 text-gray-600">Add a new product to your inventory.</p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-xl bg-white p-6 shadow">
        <div className="grid gap-6 md:grid-cols-2">
          <input className="rounded-lg border p-3" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <input className="rounded-lg border p-3" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="rounded-lg border p-3" placeholder="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          <input className="rounded-lg border p-3" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="rounded-lg border p-3" placeholder="Stock Quantity" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>

        <button type="submit" className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white">
          Save Product
        </button>
      </form>
    </section>
  );
}