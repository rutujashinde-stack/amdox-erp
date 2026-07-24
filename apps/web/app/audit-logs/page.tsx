'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../../lib/api';

interface Employee {
  id: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

interface Transaction {
  id: string;
  reference?: string;
  description?: string;
  createdAt?: string;
  date?: string;
}

interface InventoryItem {
  id: string;
  sku?: string;
  name?: string;
  createdAt?: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber?: string;
  poNumber?: string;
  createdAt?: string;
  vendor?: {
    name?: string;
  };
  supplier?: {
    name?: string;
  };
}

interface AuditItem {
  id: string;
  module: 'HR' | 'Finance' | 'Supply Chain';
  action: string;
  description: string;
  createdAt?: string;
  icon: 'employee' | 'transaction' | 'product' | 'order';
  href: string;
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AuditLogsPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [inventory, setInventory] = useState<
    InventoryItem[]
  >([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const loadAuditData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const results = await Promise.allSettled([
        api.get('/hr/employees'),
        api.get('/finance/transactions'),
        api.get('/supply-chain/inventory'),
        api.get('/supply-chain/purchase-orders'),
      ]);

      const [
        employeesResult,
        transactionsResult,
        inventoryResult,
        ordersResult,
      ] = results;

      if (employeesResult.status === 'fulfilled') {
        setEmployees(
          Array.isArray(employeesResult.value.data)
            ? employeesResult.value.data
            : [],
        );
      }

      if (transactionsResult.status === 'fulfilled') {
        setTransactions(
          Array.isArray(transactionsResult.value.data)
            ? transactionsResult.value.data
            : [],
        );
      }

      if (inventoryResult.status === 'fulfilled') {
        setInventory(
          Array.isArray(inventoryResult.value.data)
            ? inventoryResult.value.data
            : [],
        );
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(
          Array.isArray(ordersResult.value.data)
            ? ordersResult.value.data
            : [],
        );
      }

      const allFailed = results.every(
        (result) => result.status === 'rejected',
      );

      if (allFailed) {
        setError('Could not load audit activity.');
      }
    } catch (err) {
      console.error(
        'Audit activity loading failed:',
        err,
      );
      setError('Could not load audit activity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const auditItems = useMemo<AuditItem[]>(() => {
    const employeeItems: AuditItem[] = employees.map(
      (employee) => ({
        id: `employee-${employee.id}`,
        module: 'HR',
        action: 'Employee created',
        description: `${
          employee.employeeCode || 'Employee'
        } - ${employee.firstName || ''} ${
          employee.lastName || ''
        }`.trim(),
        createdAt: employee.createdAt,
        icon: 'employee',
        href: '/hr/employees',
      }),
    );

    const transactionItems: AuditItem[] =
      transactions.map((transaction) => ({
        id: `transaction-${transaction.id}`,
        module: 'Finance',
        action: 'Transaction recorded',
        description:
          transaction.reference ||
          transaction.description ||
          'Finance transaction',
        createdAt:
          transaction.createdAt || transaction.date,
        icon: 'transaction',
        href: '/finance/transactions',
      }));

    const inventoryItems: AuditItem[] = inventory.map(
      (item) => ({
        id: `inventory-${item.id}`,
        module: 'Supply Chain',
        action: 'Inventory item created',
        description: `${
          item.sku || 'SKU unavailable'
        } - ${item.name || 'Unnamed product'}`,
        createdAt: item.createdAt,
        icon: 'product',
        href: '/supply-chain/inventory',
      }),
    );

    const orderItems: AuditItem[] = orders.map(
      (order) => ({
        id: `order-${order.id}`,
        module: 'Supply Chain',
        action: 'Purchase order created',
        description: `${
          order.orderNumber ||
          order.poNumber ||
          'Purchase order'
        } - ${
          order.vendor?.name ||
          order.supplier?.name ||
          'Supplier unavailable'
        }`,
        createdAt: order.createdAt,
        icon: 'order',
        href: '/supply-chain/orders',
      }),
    );

    return [
      ...employeeItems,
      ...transactionItems,
      ...inventoryItems,
      ...orderItems,
    ].sort((first, second) => {
      const firstTime = first.createdAt
        ? new Date(first.createdAt).getTime()
        : 0;

      const secondTime = second.createdAt
        ? new Date(second.createdAt).getTime()
        : 0;

      return secondTime - firstTime;
    });
  }, [employees, transactions, inventory, orders]);

  const filteredItems = useMemo(() => {
    if (moduleFilter === 'ALL') {
      return auditItems;
    }

    return auditItems.filter(
      (item) => item.module === moduleFilter,
    );
  }, [auditItems, moduleFilter]);

  const getIcon = (icon: AuditItem['icon']) => {
    if (icon === 'employee') {
      return <Users size={20} />;
    }

    if (icon === 'transaction') {
      return <Wallet size={20} />;
    }

    if (icon === 'order') {
      return <ShoppingCart size={20} />;
    }

    return <Package size={20} />;
  };

  const getModuleClass = (
    module: AuditItem['module'],
  ) => {
    if (module === 'HR') {
      return 'bg-blue-100 text-blue-700';
    }

    if (module === 'Finance') {
      return 'bg-green-100 text-green-700';
    }

    return 'bg-purple-100 text-purple-700';
  };

  const openAuditItem = (item: AuditItem) => {
    router.push(item.href);
  };

  return (
    <section className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Activity size={30} />

            <h1 className="text-4xl font-bold">
              Audit Activity
            </h1>
          </div>

          <p className="mt-2 text-gray-600">
            Central activity view for major ERP
            operations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadAuditData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={
              refreshing ? 'animate-spin' : ''
            }
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Total recorded activities
            </p>

            <p className="mt-1 text-3xl font-bold">
              {auditItems.length}
            </p>
          </div>

          <select
            value={moduleFilter}
            onChange={(event) =>
              setModuleFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="ALL">All Modules</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Supply Chain">
              Supply Chain
            </option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
          <RefreshCw className="mx-auto animate-spin text-gray-500" />

          <p className="mt-3 text-gray-500">
            Loading audit activity...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        filteredItems.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center text-gray-500 shadow">
            No audit activity found.
          </div>
        )}

      {!loading &&
        !error &&
        filteredItems.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openAuditItem(item)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    openAuditItem(item);
                  }
                }}
                className="cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="mt-1 rounded-lg bg-slate-100 p-3 text-slate-700">
                      {getIcon(item.icon)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {item.action}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getModuleClass(
                            item.module,
                          )}`}
                        >
                          {item.module}
                        </span>
                      </div>

                      <p className="mt-2 text-gray-700">
                        {item.description}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Performed by: Admin
                      </p>

                      <p className="mt-2 text-sm font-medium text-blue-600">
                        Click to view related records
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
    </section>
  );
}