export default function SupplyChainPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="min-h-screen w-64 bg-gray-900 p-6 text-white">
          <h2 className="mb-8 text-2xl font-bold">Amdox ERP</h2>

          <nav className="space-y-3">
            <p className="rounded-lg bg-gray-700 p-3">Dashboard</p>
            <p className="rounded-lg p-3">Inventory</p>
            <p className="rounded-lg p-3">Suppliers</p>
            <p className="rounded-lg p-3">Orders</p>
            <p className="rounded-lg p-3">Reports</p>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          <h1 className="text-4xl font-bold text-red-600">
            🚀 LIVE Dashboard Test
          </h1>

          <p className="mt-2 text-gray-600">
            Manage inventory, suppliers, orders and stock levels.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              ["Total Products", "248"],
              ["Suppliers", "36"],
              ["Pending Orders", "18"],
              ["Low Stock", "7"],
            ].map(([title, value]) => (
              <div key={title} className="rounded-xl bg-white p-5 shadow">
                <p className="text-gray-500">{title}</p>
                <h2 className="mt-2 text-3xl font-bold">{value}</h2>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-semibold">
              Inventory Overview
            </h2>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="p-3">Laptop</td>
                  <td className="p-3">Electronics</td>
                  <td className="p-3">45</td>
                  <td className="p-3">TechMart</td>
                  <td className="p-3 text-green-600">Available</td>
                </tr>

                <tr className="border-b">
                  <td className="p-3">Office Chair</td>
                  <td className="p-3">Furniture</td>
                  <td className="p-3">8</td>
                  <td className="p-3">FurniCo</td>
                  <td className="p-3 text-red-600">Low Stock</td>
                </tr>

                <tr>
                  <td className="p-3">Printer</td>
                  <td className="p-3">Electronics</td>
                  <td className="p-3">22</td>
                  <td className="p-3">PrintHub</td>
                  <td className="p-3 text-green-600">Available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}