'use client';

import { Bell } from 'lucide-react';

const notifications = [
  {
    id: 1,
    message: 'Employee added successfully.',
    time: '2 minutes ago',
  },
  {
    id: 2,
    message: 'Payroll processed successfully.',
    time: '10 minutes ago',
  },
  {
    id: 3,
    message: 'Low stock alert: Laptop',
    time: '30 minutes ago',
  },
  {
    id: 4,
    message: 'Purchase Order created.',
    time: '1 hour ago',
  },
];

export default function NotificationsPage() {
  return (
    <section className="p-8">
      <div className="flex items-center gap-3">
        <Bell size={30} />
        <h1 className="text-4xl font-bold">
          Notifications
        </h1>
      </div>

      <p className="mt-2 text-gray-600">
        Recent ERP activities and alerts.
      </p>

      <div className="mt-8 space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-xl border bg-white p-5 shadow"
          >
            <p className="font-medium">
              {notification.message}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {notification.time}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}