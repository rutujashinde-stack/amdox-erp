export default function SupplyChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="min-h-screen w-64 bg-gray-900 p-6 text-white">
          <h1 className="mb-8 text-2xl font-bold">Amdox ERP</h1>

          <nav className="space-y-4">
            <a href="/supply-chain" className="block rounded-lg bg-blue-600 p-3">
              Dashboard
            </a>
            <a href="/supply-chain/inventory" className="block rounded-lg p-3 hover:bg-gray-700">
              Inventory
            </a>
            <a href="/supply-chain/products" className="block rounded-lg p-3 hover:bg-gray-700">
              Products
            </a>
            <a href="/supply-chain/add-product" className="block rounded-lg p-3 hover:bg-gray-700">
              Add Product
            </a>
            <a href="/supply-chain/suppliers" className="block rounded-lg p-3 hover:bg-gray-700">
              Suppliers
            </a>
            <a href="/supply-chain/orders" className="block rounded-lg p-3 hover:bg-gray-700">
              Orders
            </a>
            <a href="/supply-chain/reports" className="block rounded-lg p-3 hover:bg-gray-700">
              Reports
            </a>
          </nav>
        </aside>

        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
}