import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupplyChainService } from './supply-chain.service';

describe('SupplyChainService', () => {
  let service: SupplyChainService;

  const prismaService = {
    vendor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    purchaseOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const auditService = {
    createLog: jest.fn(),
  };

  const notificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          SupplyChainService,
          {
            provide: PrismaService,
            useValue: prismaService,
          },
          {
            provide: AuditService,
            useValue: auditService,
          },
          {
            provide: NotificationsService,
            useValue: notificationsService,
          },
        ],
      }).compile();

    service =
      module.get<SupplyChainService>(
        SupplyChainService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject a vendor without an email', async () => {
    await expect(
      service.createVendor(
        'tenant-id',
        {
          name: 'ABC Suppliers',
          email: '',
        },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(
      prismaService.vendor.create,
    ).not.toHaveBeenCalled();
  });

  it('should create a vendor, audit log and notification', async () => {
    const vendor = {
      id: 'vendor-id',
      tenantId: 'tenant-id',
      name: 'ABC Suppliers',
      email: 'vendor@example.com',
      phone: null,
      address: null,
    };

    prismaService.vendor.create.mockResolvedValue(
      vendor,
    );
    auditService.createLog.mockResolvedValue({
      id: 'audit-id',
    });
    notificationsService.createNotification.mockResolvedValue(
      {
        id: 'notification-id',
      },
    );

    await expect(
      service.createVendor(
        'tenant-id',
        {
          name: 'ABC Suppliers',
          email: 'VENDOR@EXAMPLE.COM',
        },
        'user-id',
      ),
    ).resolves.toEqual(vendor);

    expect(
      prismaService.vendor.create,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant-id',
        name: 'ABC Suppliers',
        email: 'vendor@example.com',
      }),
    });

    expect(
      auditService.createLog,
    ).toHaveBeenCalled();

    expect(
      notificationsService.createNotification,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Supplier created',
        tenantId: 'tenant-id',
        userId: 'user-id',
      }),
    );
  });
});