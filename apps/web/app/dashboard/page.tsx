'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Wallet,
  Users,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Package,
  ReceiptText,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import api from '../../lib/api';

interface FinanceDashboard {
  netWorth?: number | string;
  totalAssets?: number | string;
  totalLiabilities?: number | string;
  totalTransactions?: number;
}

interface HrDashboard {
  totalEmployees?: number;
  totalPayrolls?: number;
  pendingLeaves?: number;
  approvedLeaves?: number;
}

interface SupplyChainDashboard {
  totalPurchaseOrders?: number;
  totalInventoryItems?: number;
  totalVendors?: number;
  lowStockItems?: number;
}

interface Transaction {
  id: string;
  description?: string;
  reference?: string;
  amount?: number | string;
  createdAt?: string;
}

interface Employee {
  id: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
  position?: string;
  jobTitle?: string;
  createdAt?: string;
}

interface InventoryItem {
  id: string;
  sku?: string;
  name?: string;
  quantity: number;
  reorderPoint: number;
  unitPrice?: number | string;
}

interface PurchaseOrder {
  id: string;
  orderNumber?: string;
  poNumber?: string;
  status?: string;
  totalAmount?: number | string;
  createdAt?: string;
  vendor?: {
    name?: string;
  };
  supplier?: {
    name?: string;
  };
}

function formatCurrency(value: number | string | undefined) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-IN');
}

export default function DashboardPage() {
  const [finance, setFinance] = useState<FinanceDashboard | null>(null);
  const [hr, setHr] = useState<HrDashboard | null>(null);
  const [supplyChain, setSupplyChain] =
    useState<SupplyChainDashboard | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const results = await Promise.allSettled([
        api.get('/finance/dashboard'),
        api.get('/hr/dashboard'),
        api.get('/supply-chain/dashboard'),
        api.get('/finance/transactions'),
        api.get('/hr/employees'),
        api.get('/supply-chain/inventory'),
        api.get('/supply-chain/purchase-orders'),
      ]);

      const [
        financeResult,
        hrResult,
        supplyChainResult,
        transactionsResult,
        employeesResult,
        inventoryResult,
        ordersResult,
      ] = results;

      if (financeResult.status === 'fulfilled') {
        setFinance(financeResult.value.data ?? {});
      }

      if (hrResult.status === 'fulfilled') {
        setHr(hrResult.value.data ?? {});
      }

      if (supplyChainResult.status === 'fulfilled') {
        setSupplyChain(supplyChainResult.value.data ?? {});
      }

      if (transactionsResult.status === 'fulfilled') {
        setTransactions(
          Array.isArray(transactionsResult.value.data)
            ? transactionsResult.value.data
            : [],
        );
      }

      if (employeesResult.status === 'fulfilled') {
        setEmployees(
          Array.isArray(employeesResult.value.data)
            ? employeesResult.value.data
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

      const coreDashboardFailed =
        financeResult.status === 'rejected' &&
        hrResult.status === 'rejected' &&
        supplyChainResult.status === 'rejected';

      if (coreDashboardFailed) {
        setError('Could not load dashboard data.');
      }
    } catch (err) {
      console.error('Dashboard loading failed:', err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const lowStockProducts = useMemo(
    () =>
      inventory
        .filter(
          (item) =>
            Number(item.quantity) <= Number(item.reorderPoint),
        )
        .slice(0, 5),
    [inventory],
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  );

  const recentEmployees = useMemo(
    () => employees.slice(0, 5),
    [employees],
  );

  const recentOrders = useMemo(
    () => orders.slice(0, 5),
    [orders],
  );

  const overviewData = [
    {
      name: 'Employees',
      value: Number(hr?.totalEmployees ?? employees.length),
    },
    {
      name: 'Inventory',
      value: Number(
        supplyChain?.totalInventoryItems ?? inventory.length,
      ),
    },
    {
      name: 'Suppliers',
      value: Number(supplyChain?.totalVendors ?? 0),
    },
    {
      name: 'Orders',
      value: Number(
        supplyChain?.totalPurchaseOrders ?? orders.length,
      ),
    },
  ];

  const financeData = [
    {
      name: 'Assets',
      value: Number(finance?.totalAssets ?? 0),
      fill: '#16a34a',
    },
    {
      name: 'Liabilities',
      value: Number(finance?.totalLiabilities ?? 0),
      fill: '#dc2626',
    },
  ];

  return (
    <AppShell>
      <section className="min-w-0">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                Amdox ERP Dashboard
              </h1>

              <p className="mt-2 text-slate-300">
                Enterprise AI-Powered Cloud ERP Suite
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={refreshing ? 'animate-spin' : ''}
              />

              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
            <RefreshCw className="mx-auto animate-spin text-slate-500" />

            <p className="mt-3 text-slate-500">
              Loading dashboard...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-xl bg-red-50 p-5 text-red-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => loadDashboard()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/finance"
                className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Net Worth</p>
                  <Wallet className="text-green-600" />
                </div>

                <h2 className="mt-3 text-3xl font-bold text-green-600">
                  {formatCurrency(finance?.netWorth)}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Financial position
                </p>
              </Link>

              <Link
                href="/hr/employees"
                className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Employees</p>
                  <Users className="text-blue-600" />
                </div>

                <h2 className="mt-3 text-3xl font-bold">
                  {hr?.totalEmployees ?? employees.length}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Total workforce
                </p>
              </Link>

              <Link
                href="/supply-chain/orders"
                className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">
                    Purchase Orders
                  </p>

                  <ShoppingCart className="text-purple-600" />
                </div>

                <h2 className="mt-3 text-3xl font-bold">
                  {supplyChain?.totalPurchaseOrders ??
                    orders.length}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Supply chain orders
                </p>
              </Link>

              <Link
                href="/supply-chain/products"
                className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Low Stock</p>
                  <AlertTriangle className="text-red-600" />
                </div>

                <h2 className="mt-3 text-3xl font-bold text-red-600">
                  {supplyChain?.lowStockItems ??
                    lowStockProducts.length}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Products needing attention
                </p>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">
                  ERP Overview
                </h2>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">
                  Finance Snapshot
                </h2>

                {financeData.every((item) => item.value === 0) ? (
                  <div className="flex h-72 items-center justify-center text-slate-500">
                    No finance values available.
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financeData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={100}
                          label
                        />

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(
                              typeof value === 'number'
                                ? value
                                : Number(value),
                            )
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="text-green-600" />

                    <h2 className="text-xl font-bold">
                      Recent Transactions
                    </h2>
                  </div>

                  <Link
                    href="/finance/transactions"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {recentTransactions.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    No transactions found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.description ||
                              transaction.reference ||
                              'Finance transaction'}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>

                        <p className="font-bold text-green-700">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-blue-600" />

                    <h2 className="text-xl font-bold">
                      Recent Employees
                    </h2>
                  </div>

                  <Link
                    href="/hr/employees"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {recentEmployees.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    No employees found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="rounded-lg bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {employee.firstName}{' '}
                              {employee.lastName}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {employee.employeeCode || '-'} ·{' '}
                              {employee.department || 'No department'}
                            </p>
                          </div>

                          <p className="text-sm text-slate-600">
                            {employee.designation ||
                              employee.position ||
                              employee.jobTitle ||
                              '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="text-purple-600" />

                    <h2 className="text-xl font-bold">
                      Latest Purchase Orders
                    </h2>
                  </div>

                  <Link
                    href="/supply-chain/orders"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    No purchase orders found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {order.orderNumber ||
                              order.poNumber ||
                              'Purchase order'}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.vendor?.name ||
                              order.supplier?.name ||
                              'Supplier not available'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(order.totalAmount)}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.status || 'PENDING'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="text-red-600" />

                    <h2 className="text-xl font-bold">
                      Low Stock Alerts
                    </h2>
                  </div>

                  <Link
                    href="/supply-chain/products"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    View products
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {lowStockProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="font-medium text-green-700">
                      All products have sufficient stock.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-lg bg-red-50 p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {item.name || 'Unnamed product'}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            SKU: {item.sku || '-'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-red-700">
                            {item.quantity} remaining
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Reorder at {item.reorderPoint}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold">
                System Summary
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Link
                  href="/finance/transactions"
                  className="rounded-lg bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <p className="text-sm text-slate-500">
                    Finance Transactions
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {finance?.totalTransactions ??
                      transactions.length}
                  </p>
                </Link>

                <Link
                  href="/hr/payroll"
                  className="rounded-lg bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <p className="text-sm text-slate-500">
                    Payroll Records
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {hr?.totalPayrolls ?? 0}
                  </p>
                </Link>

                <Link
                  href="/hr/leaves"
                  className="rounded-lg bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <p className="text-sm text-slate-500">
                    Pending Leaves
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {hr?.pendingLeaves ?? 0}
                  </p>
                </Link>

                <Link
                  href="/supply-chain/products"
                  className="rounded-lg bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <p className="text-sm text-slate-500">
                    Inventory Items
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {supplyChain?.totalInventoryItems ??
                      inventory.length}
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}