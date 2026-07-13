"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSupplierPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("amdox_token");

    if (!token) {
      alert("Please log in first.");
      router.push("/login");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supply-chain/vendors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            address,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add supplier");
      }

      alert("Supplier added successfully!");
      router.push("/supply-chain/suppliers");
    } catch (error) {
      console.error("Supplier creation failed:", error);

      alert(
        error instanceof Error
          ? `Failed to add supplier: ${error.message}`
          : "Failed to add supplier"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">Add Supplier</h1>

      <p className="mt-2 text-gray-600">
        Add a new supplier to the supply chain module.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <input
            className="rounded-lg border p-3"
            placeholder="Supplier Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Supplier"}
        </button>
      </form>
    </section>
  );
}