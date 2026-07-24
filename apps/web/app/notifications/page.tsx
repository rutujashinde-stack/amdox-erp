'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../../lib/api';

interface FinanceDashboard {
  netWorth?: number | string;
  totalTransactions?: number;
}

interface HrDashboard {
  totalEmployees?: number;
  totalPayrolls?: number;
  pendingLeaves?: number;
}

interface SupplyChainDashboard {
  totalPurchaseOrders?: number;
  totalInventoryItems?: number;
  totalVendors?: number;
  lowStockItems?: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  icon: 'finance' | 'employee' | 'order' | 'stock';
  href: string;
}

export default function NotificationsPage() {
  const router = useRouter();

  const [finance, setFinance] =
    useState<FinanceDashboard>({});
  const [hr, setHr] = useState<HrDashboard>({});
  const [supplyChain, setSupplyChain] =
    useState<SupplyChainDashboard>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setError('');

        const [
          financeResponse,
          hrResponse,
          supplyChainResponse,
        ] = await Promise.all([
          api.get('/finance/dashboard'),
          api.get('/hr/dashboard'),
          api.get('/supply-chain/dashboard'),
        ]);

        setFinance(financeResponse.data ?? {});
        setHr(hrResponse.data ?? {});
        setSupplyChain(supplyChainResponse.data ?? {});
      } catch (err) {
        console.error('Notification loading failed:', err);
        setError('Could not load live ERP notifications.');
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    const lowStockItems = Number(
      supplyChain.lowStockItems ?? 0,
    );
    const totalEmployees = Number(hr.totalEmployees ?? 0);
    const totalPayrolls = Number(hr.totalPayrolls ?? 0);
    const pendingLeaves = Number(hr.pendingLeaves ?? 0);
    const totalOrders = Number(
      supplyChain.totalPurchaseOrders ?? 0,
    );
    const totalTransactions = Number(
      finance.totalTransactions ?? 0,
    );

    if (lowStockItems > 0) {
      items.push({
        id: 'low-stock',
        title: 'Low stock alert',
        message: `${lowStockItems} product${
          lowStockItems === 1 ? '' : 's'
        } need restocking.`,
        type: 'warning',
        icon: 'stock',
        href: '/supply-chain/inventory',
      });
    } else {
      items.push({
        id: 'stock-ok',
        title: 'Inventory status',
        message:
          'All products currently have sufficient stock.',
        type: 'success',
        icon: 'stock',
        href: '/supply-chain/inventory',
      });
    }

    items.push({
      id: 'employees',
      title: 'Employee summary',
      message: `${totalEmployees} employee${
        totalEmployees === 1 ? '' : 's'
      } are currently registered in the ERP.`,
      type: 'info',
      icon: 'employee',
      href: '/hr/employees',
    });

    items.push({
      id: 'payroll',
      title: 'Payroll summary',
      message: `${totalPayrolls} payroll record${
        totalPayrolls === 1 ? '' : 's'
      } have been processed.`,
      type: 'success',
      icon: 'employee',
      href: '/hr/payroll',
    });

    if (pendingLeaves > 0) {
      items.push({
        id: 'pending-leaves',
        title: 'Pending leave requests',
        message: `${pendingLeaves} leave request${
          pendingLeaves === 1 ? ' is' : 's are'
        } waiting for review.`,
        type: 'warning',
        icon: 'employee',
        href: '/hr/leaves',
      });
    }

    items.push({
      id: 'orders',
      title: 'Purchase order summary',
      message: `${totalOrders} purchase order${
        totalOrders === 1 ? '' : 's'
      } are available in the system.`,
      type: 'info',
      icon: 'order',
      href: '/supply-chain/orders',
    });

    items.push({
      id: 'transactions',
      title: 'Finance activity',
      message: `${totalTransactions} finance transaction${
        totalTransactions === 1 ? '' : 's'
      } have been recorded.`,
      type: 'info',
      icon: 'finance',
      href: '/finance/transactions',
    });

    return items;
  }, [finance, hr, supplyChain]);

  const unreadCount = notifications.filter(
    (notification) =>
      !readIds.includes(notification.id),
  ).length;

  const markAsRead = (id: string) => {
    setReadIds((current) =>
      current.includes(id)
        ? current
        : [...current, id],
    );
  };

  const markAllAsRead = () => {
    setReadIds(
      notifications.map(
        (notification) => notification.id,
      ),
    );
  };

  const openNotification = (
    notification: NotificationItem,
  ) => {
    markAsRead(notification.id);
    router.push(notification.href);
  };

  const getIcon = (
    icon: NotificationItem['icon'],
  ) => {
    if (icon === 'finance') {
      return <Wallet size={22} />;
    }

    if (icon === 'employee') {
      return <Users size={22} />;
    }

    if (icon === 'order') {
      return <ShoppingCart size={22} />;
    }

    return <AlertTriangle size={22} />;
  };

  const getCardClass = (
    type: NotificationItem['type'],
  ) => {
    if (type === 'warning') {
      return 'border-yellow-200 bg-yellow-50';
    }

    if (type === 'success') {
      return 'border-green-200 bg-green-50';
    }

    return 'border-blue-200 bg-blue-50';
  };

  const getIconClass = (
    type: NotificationItem['type'],
  ) => {
    if (type === 'warning') {
      return 'text-yellow-700';
    }

    if (type === 'success') {
      return 'text-green-700';
    }

    return 'text-blue-700';
  };

  return (
    <section className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Bell size={30} />

            <h1 className="text-4xl font-bold">
              Notifications
            </h1>
          </div>

          <p className="mt-2 text-gray-600">
            Live alerts and activity summaries from your ERP
            data.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="rounded-lg bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark All as Read
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow">
        <div className="flex items-center justify-between">
          <p className="font-medium text-slate-700">
            Notification Summary
          </p>

          <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
            {unreadCount} unread
          </span>
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-center text-gray-500">
          Loading notifications...
        </p>
      )}

      {error && (
        <p className="mt-8 text-center text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-8 space-y-4">
          {notifications.map((notification) => {
            const isRead = readIds.includes(
              notification.id,
            );

            return (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openNotification(notification)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    openNotification(notification);
                  }
                }}
                className={`cursor-pointer rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  getCardClass(notification.type)
                } ${isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 ${getIconClass(
                        notification.type,
                      )}`}
                    >
                      {getIcon(notification.icon)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">
                          {notification.title}
                        </h2>

                        {!isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        )}
                      </div>

                      <p className="mt-1 text-gray-700">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Click to view related records
                      </p>
                    </div>
                  </div>

                  {isRead ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <CheckCircle2 size={18} />
                      Read
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow hover:bg-slate-100"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}