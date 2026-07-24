'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../../lib/api';

interface SupplyChainDashboard {
  totalVendors: number;
  totalPurchaseOrders: number;
  totalInventoryItems: number;
  lowStockItems: number;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorderPoint: number;
}

interface ForecastPoint {
  date: string;
  predictedDemand: number;
}

interface ForecastResponse {
  sku: string;
  horizonDays: number;
  forecast: ForecastPoint[];
  totalPredictedDemand: number;
  averageDailyDemand: number;
  trainingMape: number;
  model: string;
}

function getHistoryDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date();
    currentDate.setDate(
      currentDate.getDate() - (6 - index),
    );

    return currentDate.toISOString().slice(0, 10);
  });
}

export default function ReportsPage() {
  const [dashboard, setDashboard] =
    useState<SupplyChainDashboard | null>(null);
  const [inventory, setInventory] = useState<
    InventoryItem[]
  >([]);
  const [lowStock, setLowStock] = useState<
    InventoryItem[]
  >([]);

  const [selectedSku, setSelectedSku] = useState('');
  const [demandValues, setDemandValues] = useState([
    '10',
    '12',
    '13',
    '15',
    '17',
    '18',
    '20',
  ]);
  const [horizonDays, setHorizonDays] = useState(7);
  const [forecast, setForecast] =
    useState<ForecastResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [forecasting, setForecasting] =
    useState(false);
  const [error, setError] = useState('');
  const [forecastError, setForecastError] =
    useState('');

  const historyDates = useMemo(
    () => getHistoryDates(),
    [],
  );

  useEffect(() => {
    async function loadReports() {
      try {
        setError('');

        const [
          dashboardResponse,
          inventoryResponse,
          lowStockResponse,
        ] = await Promise.all([
          api.get('/supply-chain/dashboard'),
          api.get('/supply-chain/inventory'),
          api.get(
            '/supply-chain/inventory/low-stock',
          ),
        ]);

        const inventoryItems = Array.isArray(
          inventoryResponse.data,
        )
          ? inventoryResponse.data
          : [];

        setDashboard(dashboardResponse.data);
        setInventory(inventoryItems);
        setLowStock(
          Array.isArray(lowStockResponse.data)
            ? lowStockResponse.data
            : [],
        );

        if (inventoryItems.length > 0) {
          setSelectedSku(inventoryItems[0].sku);
        }
      } catch (err) {
        console.error(
          'Supply chain report loading failed:',
          err,
        );
        setError(
          'Could not load supply chain reports.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const chartData = [
    {
      name: 'Vendors',
      value: dashboard?.totalVendors ?? 0,
    },
    {
      name: 'Orders',
      value:
        dashboard?.totalPurchaseOrders ?? 0,
    },
    {
      name: 'Inventory',
      value:
        dashboard?.totalInventoryItems ?? 0,
    },
    {
      name: 'Low Stock',
      value: dashboard?.lowStockItems ?? 0,
    },
  ];

  const updateDemand = (
    index: number,
    value: string,
  ) => {
    setDemandValues((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    );
  };

  const generateForecast = async () => {
    try {
      setForecasting(true);
      setForecastError('');
      setForecast(null);

      if (!selectedSku) {
        setForecastError(
          'Create an inventory item before generating a forecast.',
        );
        return;
      }

      const history = historyDates.map(
        (date, index) => ({
          date,
          demand: Number(demandValues[index]),
        }),
      );

      if (
        history.some(
          (item) =>
            !Number.isFinite(item.demand) ||
            item.demand < 0,
        )
      ) {
        setForecastError(
          'Every historical demand value must be zero or greater.',
        );
        return;
      }

      await api.post('/forecasting/train', {
        sku: selectedSku,
        history,
      });

      const response =
        await api.post<ForecastResponse>(
          '/forecasting/predict',
          {
            sku: selectedSku,
            horizon_days: horizonDays,
          },
        );

      setForecast(response.data);
    } catch (err) {
      console.error(
        'Forecast generation failed:',
        err,
      );
      setForecastError(
        'Could not generate the forecast. Ensure the ML service is running and try again.',
      );
    } finally {
      setForecasting(false);
    }
  };

  if (loading) {
    return (
      <section className="p-8">
        <p className="text-gray-500">
          Loading supply chain reports...
        </p>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h1 className="text-4xl font-bold">
        Supply Chain Reports
      </h1>

      <p className="mt-2 text-gray-600">
        Live stock reports, order summaries and
        AI-powered demand forecasting.
      </p>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">Vendors</h2>
          <p className="mt-2 text-3xl font-bold">
            {dashboard?.totalVendors ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">Orders</h2>
          <p className="mt-2 text-3xl font-bold">
            {dashboard?.totalPurchaseOrders ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">
            Inventory Items
          </h2>
          <p className="mt-2 text-3xl font-bold">
            {dashboard?.totalInventoryItems ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-gray-500">
            Low Stock Alerts
          </h2>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {dashboard?.lowStockItems ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">
          Supply Chain Summary
        </h2>

        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
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

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl font-semibold">
          AI Demand Forecast
        </h2>

        <p className="mt-2 text-gray-600">
          Enter demand from the previous seven days to
          predict demand for the selected SKU.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">
              Inventory SKU
            </span>

            <select
              value={selectedSku}
              onChange={(event) =>
                setSelectedSku(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 p-3"
            >
              {inventory.length === 0 && (
                <option value="">
                  No inventory items available
                </option>
              )}

              {inventory.map((item) => (
                <option
                  key={item.id}
                  value={item.sku}
                >
                  {item.sku} - {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Forecast horizon
            </span>

            <select
              value={horizonDays}
              onChange={(event) =>
                setHorizonDays(
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 p-3"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {historyDates.map((date, index) => (
            <label key={date} className="block">
              <span className="text-xs font-medium text-gray-600">
                {date}
              </span>

              <input
                type="number"
                min="0"
                value={demandValues[index]}
                onChange={(event) =>
                  updateDemand(
                    index,
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={generateForecast}
          disabled={
            forecasting || inventory.length === 0
          }
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {forecasting
            ? 'Training and forecasting...'
            : 'Generate AI Forecast'}
        </button>

        {forecastError && (
          <p className="mt-4 text-red-600">
            {forecastError}
          </p>
        )}

        {forecast && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-gray-600">
                  Total predicted demand
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {forecast.totalPredictedDemand}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-gray-600">
                  Average daily demand
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {forecast.averageDailyDemand}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm text-gray-600">
                  Training MAPE
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {forecast.trainingMape}%
                </p>
              </div>
            </div>

            <div className="mt-6 h-80">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={forecast.forecast}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="predictedDemand"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">
          Low Stock Report
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3">SKU</th>
                <th className="border p-3">
                  Product
                </th>
                <th className="border p-3">
                  Current Stock
                </th>
                <th className="border p-3">
                  Reorder Point
                </th>
                <th className="border p-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {lowStock.map((item) => (
                <tr key={item.id}>
                  <td className="border p-3">
                    {item.sku}
                  </td>
                  <td className="border p-3">
                    {item.name}
                  </td>
                  <td className="border p-3 text-red-600">
                    {item.quantity}
                  </td>
                  <td className="border p-3">
                    {item.reorderPoint}
                  </td>
                  <td className="border p-3">
                    Reorder Required
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lowStock.length === 0 && (
          <p className="py-6 text-center text-gray-500">
            No low-stock items.
          </p>
        )}
      </div>
    </section>
  );
}