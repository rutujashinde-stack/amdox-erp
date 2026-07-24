'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
  Wallet,
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
    <aside className="sticky top-0 z-[100] flex h-screen w-64 shrink-0 flex-col bg-slate-950 p-6 text-white">
      <Link
        href="/dashboard"
        className="relative z-[110] mb-6 block cursor-pointer rounded-lg p-2 transition hover:bg-slate-900"
      >
        <h1 className="text-2xl font-bold hover:text-blue-400">
          ERP
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Enterprise Resource Planning System
        </p>
      </Link>

      <nav className="relative z-[110] space-y-2">
        <Link
          href="/dashboard"
          className={mainLinkClass('/dashboard')}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/finance"
          className={mainLinkClass('/finance')}
        >
          <Wallet size={20} />
          Finance
        </Link>

        <Link
          href="/hr"
          className={mainLinkClass('/hr')}
        >
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
            className={subLinkClass(
              '/supply-chain/inventory',
            )}
          >
            Inventory
          </Link>

          <Link
            href="/supply-chain/suppliers"
            className={subLinkClass(
              '/supply-chain/suppliers',
            )}
          >
            Suppliers
          </Link>

          <Link
            href="/supply-chain/orders"
            className={subLinkClass(
              '/supply-chain/orders',
            )}
          >
            Purchase Orders
          </Link>
        </div>

        <Link
          href="/notifications"
          className={mainLinkClass('/notifications')}
        >
          <Bell size={20} />
          Notifications
        </Link>

        <Link
          href="/audit-logs"
          className={mainLinkClass('/audit-logs')}
        >
          <Activity size={20} />
          Audit Activity
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="relative z-[110] mt-auto flex items-center gap-3 rounded-lg p-3 text-left transition hover:bg-red-600"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}