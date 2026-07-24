import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  const configService = {
    get: jest.fn(
      (key: string) =>
        key === 'DATABASE_URL'
          ? 'postgresql://test:test@localhost:5432/test'
          : undefined,
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          PrismaService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

    service =
      module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should read DATABASE_URL from configuration', () => {
    expect(configService.get).toHaveBeenCalledWith(
      'DATABASE_URL',
    );
  });

  it('should reject missing DATABASE_URL', () => {
    const missingConfig = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(
      () => new PrismaService(missingConfig),
    ).toThrow(
      'DATABASE_URL is missing. Check apps/api/.env',
    );
  });
});