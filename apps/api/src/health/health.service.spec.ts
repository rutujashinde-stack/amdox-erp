import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  const prismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          HealthService,
          {
            provide: PrismaService,
            useValue: prismaService,
          },
        ],
      }).compile();

    service =
      module.get<HealthService>(HealthService);
  });

  it('should return API liveness', () => {
    expect(service.getLiveness()).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'amdox-erp-api',
      }),
    );
  });

  it('should report a healthy database', async () => {
    prismaService.$queryRaw.mockResolvedValue([
      { '?column?': 1 },
    ]);

    await expect(
      service.getDatabaseHealth(),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'connected',
      }),
    );
  });

  it('should reject an unavailable database', async () => {
    prismaService.$queryRaw.mockRejectedValue(
      new Error('Database unavailable'),
    );

    await expect(
      service.getDatabaseHealth(),
    ).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});