'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, Users, Package, LogOut } from 'lucide-react';
import { useAuthStore } from '../../lib/authStore';

export default function Sidebar() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="sticky top-0 h-screen w-64 bg-slate-950 p-6 text-white">
      <h1 className="mb-2 text-2xl font-bold">Amdox ERP</h1>
      <p className="mb-8 text-sm text-slate-400">Cloud ERP Suite</p>

      <nav className="space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link href="/finance" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800">
          <Wallet size={20} />
          Finance
        </Link>

        <Link href="/hr" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800">
          <Users size={20} />
          HR & Payroll
        </Link>

        <Link href="/supply-chain" className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800">
          <Package size={20} />
          Supply Chain
        </Link>

        <div className="ml-9 space-y-1 text-sm text-slate-300">
          <Link href="/supply-chain/inventory" className="block rounded p-2 hover:bg-slate-800">
            Inventory
          </Link>
          <Link href="/supply-chain/suppliers" className="block rounded p-2 hover:bg-slate-800">
            Suppliers
          </Link>
          <Link href="/supply-chain/orders" className="block rounded p-2 hover:bg-slate-800">
            Purchase Orders
          </Link>
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-6 flex w-52 items-center gap-3 rounded-lg p-3 text-left hover:bg-red-600"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}