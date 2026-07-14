'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Users,
  Package,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../lib/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const mainLinkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg p-3 transition ${
      pathname === href
        ? 'bg-slate-800 text-white'
        : 'text-slate-200 hover:bg-slate-800'
    }`;

  const subLinkClass = (href: string) =>
    `block rounded p-2 transition ${
      pathname === href
        ? 'bg-slate-800 text-white'
        : 'text-slate-300 hover:bg-slate-800'
    }`;

  return (
    <aside className="sticky top-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-slate-950 p-6 text-white">
      <Link
        href="/dashboard"
        className="relative z-10 block rounded-lg p-1 hover:bg-slate-900"
      >
        <h1 className="text-2xl font-bold hover:text-blue-400">
          Amdox ERP
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          AI-Powered Cloud ERP Suite
        </p>
      </Link>

      <nav className="mt-8 space-y-2">
        <Link href="/dashboard" className={mainLinkClass('/dashboard')}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link href="/finance" className={mainLinkClass('/finance')}>
          <Wallet size={20} />
          Finance
        </Link>

        <Link href="/hr" className={mainLinkClass('/hr')}>
          <Users size={20} />
          HR & Payroll
        </Link>

        <Link
          href="/supply-chain"
          className={mainLinkClass('/supply-chain')}
        >
          <Package size={20} />
          Supply Chain
        </Link>

        <div className="ml-9 space-y-1 text-sm">
          <Link
            href="/supply-chain/inventory"
            className={subLinkClass('/supply-chain/inventory')}
          >
            Inventory
          </Link>

          <Link
            href="/supply-chain/suppliers"
            className={subLinkClass('/supply-chain/suppliers')}
          >
            Suppliers
          </Link>

          <Link
            href="/supply-chain/orders"
            className={subLinkClass('/supply-chain/orders')}
          >
            Purchase Orders
          </Link>
        </div>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-lg p-3 text-left transition hover:bg-red-600"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}