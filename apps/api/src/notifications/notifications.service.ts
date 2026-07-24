import { Injectable } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEvent,
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface NotificationFilters {
  tenantId: string;
  userId?: string;
  event?: NotificationEvent;
  isRead?: boolean;
}

interface CreateNotificationInput {
  tenantId: string;
  userId?: string;
  event: NotificationEvent;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createNotification(
    input: CreateNotificationInput,
  ) {
    return this.prisma.notification.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        event: input.event,
        title: input.title,
        message: input.message,
        data: input.data,
        deliveries: {
          create: {
            channel: NotificationChannel.IN_APP,
            status:
              NotificationDeliveryStatus.DELIVERED,
            attempts: 1,
            deliveredAt: new Date(),
          },
        },
      },
      include: {
        deliveries: true,
      },
    });
  }

  async getNotifications(
    filters: NotificationFilters,
  ) {
    const where: Prisma.NotificationWhereInput = {
      tenantId: filters.tenantId,
    };

    if (filters.userId) {
      where.OR = [
        { userId: filters.userId },
        { userId: null },
      ];
    }

    if (filters.event) {
      where.event = filters.event;
    }

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    return this.prisma.notification.findMany({
      where,
      include: {
        deliveries: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    });
  }

  async getUnreadCount(
    tenantId: string,
    userId?: string,
  ) {
    const where: Prisma.NotificationWhereInput = {
      tenantId,
      isRead: false,
    };

    if (userId) {
      where.OR = [
        { userId },
        { userId: null },
      ];
    }

    const unreadCount =
      await this.prisma.notification.count({
        where,
      });

    return { unreadCount };
  }

  async markAllAsRead(
    tenantId: string,
    userId?: string,
  ) {
    const where: Prisma.NotificationWhereInput = {
      tenantId,
      isRead: false,
    };

    if (userId) {
      where.OR = [
        { userId },
        { userId: null },
      ];
    }

    const result =
      await this.prisma.notification.updateMany({
        where,
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

    return {
      updatedCount: result.count,
    };
  }

  async markAsRead(
    tenantId: string,
    id: string,
    userId?: string,
  ) {
    const notification =
      await this.prisma.notification.findFirst({
        where: {
          id,
          tenantId,
          OR: userId
            ? [
                { userId },
                { userId: null },
              ]
            : undefined,
        },
      });

    if (!notification) {
      return {
        message: 'Notification not found.',
      };
    }

    return this.prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getPreferences(
    tenantId: string,
    userId: string,
  ) {
    return this.prisma.notificationPreference.findMany({
      where: {
        tenantId,
        userId,
      },
      orderBy: [
        { event: 'asc' },
        { channel: 'asc' },
      ],
    });
  }

  async updatePreference(
    tenantId: string,
    userId: string,
    body: {
      event: NotificationEvent;
      channel: NotificationChannel;
      enabled: boolean;
    },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_event_channel: {
          userId,
          event: body.event,
          channel: body.channel,
        },
      },
      update: {
        tenantId,
        enabled: body.enabled,
      },
      create: {
        tenantId,
        userId,
        event: body.event,
        channel: body.channel,
        enabled: body.enabled,
      },
    });
  }

  async processPendingDeliveries() {
    return {
      processedCount: 0,
      message:
        'External email and SMS providers are not configured yet.',
    };
  }
}