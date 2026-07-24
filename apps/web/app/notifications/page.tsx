'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../../lib/api';

interface NotificationData {
  entityType?: string;
  entityId?: string;
  href?: string;
}

interface NotificationItem {
  id: string;
  event: string;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
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

function getNotificationDestination(
  notification: NotificationItem,
) {
  if (notification.data?.href) {
    return notification.data.href;
  }

  const event = notification.event.toUpperCase();

  if (event.includes('ACCOUNT')) {
    return '/finance';
  }

  if (event.includes('TRANSACTION')) {
    return '/finance/transactions';
  }

  if (event.includes('INVOICE')) {
    return '/finance/invoices';
  }

  if (event.includes('EMPLOYEE')) {
    return '/hr/employees';
  }

  if (event.includes('PAYROLL')) {
    return '/hr/payroll';
  }

  if (event.includes('LEAVE')) {
    return '/hr/leaves';
  }

  if (event.includes('VENDOR')) {
    return '/supply-chain/suppliers';
  }

  if (event.includes('PURCHASE_ORDER')) {
    return '/supply-chain/orders';
  }

  if (
    event.includes('INVENTORY') ||
    event.includes('LOW_STOCK')
  ) {
    return '/supply-chain/inventory';
  }

  return '/dashboard';
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (err) {
      console.error(
        'Notification loading failed:',
        err,
      );
      setError(
        'Could not load notifications. Please log in again and retry.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.isRead,
      ).length,
    [notifications],
  );

  const markAsRead = async (id: string) => {
    const notification = notifications.find(
      (item) => item.id === id,
    );

    if (!notification || notification.isRead) {
      return;
    }

    await api.patch(`/notifications/${id}/read`);

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isRead: true,
              readAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const openNotification = async (
    notification: NotificationItem,
  ) => {
    try {
      await markAsRead(notification.id);
    } catch (err) {
      console.error(
        'Could not mark notification as read:',
        err,
      );
    }

    router.push(
      getNotificationDestination(notification),
    );
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await api.patch('/notifications/read-all');

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt,
        })),
      );
    } catch (err) {
      console.error(
        'Could not mark all notifications as read:',
        err,
      );
      setError(
        'Could not mark all notifications as read.',
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (event: string) => {
    const normalizedEvent = event.toUpperCase();

    if (
      normalizedEvent.includes('ACCOUNT') ||
      normalizedEvent.includes('TRANSACTION') ||
      normalizedEvent.includes('INVOICE')
    ) {
      return <Wallet size={22} />;
    }

    if (
      normalizedEvent.includes('EMPLOYEE') ||
      normalizedEvent.includes('PAYROLL') ||
      normalizedEvent.includes('LEAVE')
    ) {
      return <Users size={22} />;
    }

    if (
      normalizedEvent.includes('PURCHASE_ORDER')
    ) {
      return <ShoppingCart size={22} />;
    }

    if (
      normalizedEvent.includes('INVENTORY') ||
      normalizedEvent.includes('VENDOR')
    ) {
      return <Package size={22} />;
    }

    if (normalizedEvent.includes('LOW_STOCK')) {
      return <AlertTriangle size={22} />;
    }

    return <FileText size={22} />;
  };

  const getCardClass = (event: string) => {
    const normalizedEvent = event.toUpperCase();

    if (
      normalizedEvent.includes('LOW_STOCK') ||
      normalizedEvent.includes('ALERT')
    ) {
      return 'border-yellow-200 bg-yellow-50';
    }

    if (
      normalizedEvent.includes('CREATED') ||
      normalizedEvent.includes('PROCESSED')
    ) {
      return 'border-green-200 bg-green-50';
    }

    return 'border-blue-200 bg-blue-50';
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
            Persistent alerts generated by ERP business
            events.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={
              unreadCount === 0 || markingAll
            }
            className="rounded-lg bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll
              ? 'Marking...'
              : 'Mark All as Read'}
          </button>
        </div>
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

      {error && !loading && (
        <div className="mt-8 rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        notifications.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center text-gray-500 shadow">
            No notifications have been generated yet.
          </div>
        )}

      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="mt-8 space-y-4">
            {notifications.map((notification) => (
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
                className={`cursor-pointer rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${getCardClass(
                  notification.event,
                )} ${
                  notification.isRead
                    ? 'opacity-60'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="mt-1 text-slate-700">
                      {getIcon(notification.event)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">
                          {notification.title}
                        </h2>

                        {!notification.isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        )}
                      </div>

                      <p className="mt-1 text-gray-700">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        {formatDateTime(
                          notification.createdAt,
                        )}
                      </p>

                      <p className="mt-2 text-sm font-medium text-blue-600">
                        Click to view related records
                      </p>
                    </div>
                  </div>

                  {notification.isRead ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <CheckCircle2 size={18} />
                      Read
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={async (event) => {
                        event.stopPropagation();

                        try {
                          await markAsRead(
                            notification.id,
                          );
                        } catch (err) {
                          console.error(
                            'Could not mark notification as read:',
                            err,
                          );
                        }
                      }}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow hover:bg-slate-100"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </section>
  );
}