import { Injectable } from '@nestjs/common';
import {
  AuditAction,
  AuditModule,
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAuditLogInput {
  tenantId: string;
  userId?: string;
  module: AuditModule;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogFilters {
  tenantId: string;
  module?: AuditModule;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        module: input.module,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        description: input.description,
        oldValues: input.oldValues,
        newValues: input.newValues,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async getLogs(filters: AuditLogFilters) {
    const where: Prisma.AuditLogWhereInput = {
      tenantId: filters.tenantId,
    };

    if (filters.module) {
      where.module = filters.module;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entityType = {
        contains: filters.entityType,
        mode: 'insensitive',
      };
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};

      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }

      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    });
  }

  async getLogById(tenantId: string, id: string) {
    return this.prisma.auditLog.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}