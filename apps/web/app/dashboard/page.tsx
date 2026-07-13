'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import api from '../../lib/api';

export default function DashboardPage() {
  const [finance, setFinance] = useState<any>(null);
  const [hr, setHr] = useState<any>(null);
  const [supplyChain, setSupplyChain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [financeResponse, hrResponse, supplyChainResponse] =
          await Promise.all([
            api.get('/finance/dashboard'),
            api.get('/hr/dashboard'),
            api.get('/supply-chain/dashboard'),
          ]);

        setFinance(financeResponse.data);
        setHr(hrResponse.data);
        setSupplyChain(supplyChainResponse.data);
      } catch (error) {
        console.error('Dashboard loading failed:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const overviewData = [
    {
      name: 'Employees',
      value: Number(hr?.totalEmployees ?? 0),
    },
    {
      name: 'Inventory',
      value: Number(supplyChain?.totalInventoryItems ?? 0),
    },
    {
      name: 'Suppliers',
      value: Number(supplyChain?.totalVendors ?? 0),
    },
    {
      name: 'Orders',
      value: Number(supplyChain?.totalPurchaseOrders ?? 0),
    },
  ];

  const financeData = [
    {
      name: 'Assets',
      value: Number(finance?.totalAssets ?? 0),
    },
    {
      name: 'Liabilities',
      value: Number(finance?.totalLiabilities ?? 0),
    },
  ];

  return (
    <AppShell>
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow">
        <h1 className="text-4xl font-bold">Amdox ERP Dashboard</h1>

        <p className="mt-2 text-slate-300">
          Enterprise AI-Powered Cloud ERP Suite
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Net Worth</p>
                <Wallet className="text-green-600" />
              </div>

              <h2 className="mt-3 text-3xl font-bold text-green-600">
                ₹
                {Number(finance?.netWorth ?? 0).toLocaleString(
                  'en-IN',
                )}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Financial position
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Employees</p>
                <Users className="text-blue-600" />
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                {hr?.totalEmployees ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Total workforce
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Purchase Orders</p>
                <ShoppingCart className="text-purple-600" />
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                {supplyChain?.totalPurchaseOrders ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Supply chain orders
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Low Stock</p>
                <AlertTriangle className="text-red-600" />
              </div>

              <h2 className="mt-3 text-3xl font-bold text-red-600">
                {supplyChain?.lowStockItems ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Needs attention
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">
                Finance Snapshot
              </h2>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financeData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label
                    >
                      {financeData.map((item) => (
                        <Cell key={item.name} />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">System Summary</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Finance Transactions
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {finance?.totalTransactions ?? 0}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Payroll Records
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {hr?.totalPayrolls ?? 0}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Pending Leaves
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {hr?.pendingLeaves ?? 0}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Inventory Items
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {supplyChain?.totalInventoryItems ?? 0}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}