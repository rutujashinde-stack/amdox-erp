"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import { Wallet, Users, ShoppingCart, AlertTriangle } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import api from "../../lib/api";

export default function DashboardPage() {
  const [finance, setFinance] = useState<any>(null);
  const [hr, setHr] = useState<any>(null);
  const [supplyChain, setSupplyChain] = useState<any>(null);

  useEffect(() => {
    api.get("/finance/dashboard").then((res) => setFinance(res.data)).catch(() => {});
    api.get("/hr/dashboard").then((res) => setHr(res.data)).catch(() => {});
    api.get("/supply-chain/dashboard").then((res) => setSupplyChain(res.data)).catch(() => {});
  }, []);

  const overviewData = [
    { name: "Net Worth", value: finance?.netWorth ?? 0 },
    { name: "Employees", value: hr?.totalEmployees ?? 0 },
    { name: "Orders", value: supplyChain?.totalOrders ?? 0 },
    { name: "Inventory", value: supplyChain?.totalInventoryItems ?? 0 },
  ];

  const financeData = [
    { name: "Assets", value: finance?.totalAssets ?? 0 },
    { name: "Liabilities", value: finance?.totalLiabilities ?? 0 },
  ];

  return (
    <AppShell>
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow">
        <h1 className="text-4xl font-bold">Amdox ERP Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Enterprise AI-Powered Cloud ERP Suite
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-slate-500">Net Worth</p>
            <Wallet className="text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-green-600">
            ₹{Number(finance?.netWorth ?? 0).toLocaleString()}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Financial position</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-slate-500">Employees</p>
            <Users className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">
            {hr?.totalEmployees ?? 0}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Active workforce</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-slate-500">Purchase Orders</p>
            <ShoppingCart className="text-purple-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold">
            {supplyChain?.totalOrders ?? 0}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Supply chain orders</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-slate-500">Low Stock</p>
            <AlertTriangle className="text-red-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-red-600">
            {supplyChain?.lowStockAlerts ?? 0}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Needs attention</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">ERP Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Finance Snapshot</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={financeData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {financeData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}