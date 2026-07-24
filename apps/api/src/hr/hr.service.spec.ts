import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { HrService } from './hr.service';

describe('HrService', () => {
  let service: HrService;

  const prismaService = {
    employee: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    payroll: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    leave: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
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
          HrService,
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

    service = module.get<HrService>(HrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject payroll when the period is missing', async () => {
    await expect(
      service.processPayroll(
        'tenant-id',
        '',
        'user-id',
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(
      prismaService.employee.findMany,
    ).not.toHaveBeenCalled();
  });

  it('should reject a leave request when the end date is before the start date', async () => {
    await expect(
      service.applyLeave(
        'tenant-id',
        {
          employeeId:
            '11111111-1111-4111-8111-111111111111',
          type: 'SICK',
          startDate: '2026-07-20',
          endDate: '2026-07-18',
        },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(
      prismaService.leave.create,
    ).not.toHaveBeenCalled();
  });
});