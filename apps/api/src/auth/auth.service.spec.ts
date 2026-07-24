import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const jwtService = {
    sign: jest.fn(),
  };

  const prismaService = {
    tenant: {
      upsert: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
  };

  const configService = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        DEMO_ADMIN_EMAIL: 'admin@amdox.com',
        DEMO_ADMIN_PASSWORD: 'admin123',
      };

      return values[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: JwtService,
            useValue: jwtService,
          },
          {
            provide: PrismaService,
            useValue: prismaService,
          },
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    await expect(
      service.login(
        'wrong@example.com',
        'wrong-password',
      ),
    ).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(
      prismaService.tenant.upsert,
    ).not.toHaveBeenCalled();
  });

  it('should return a JWT for valid credentials', async () => {
    prismaService.tenant.upsert.mockResolvedValue({
      id: 'tenant-id',
      slug: 'amdox-demo',
    });

    prismaService.user.upsert.mockResolvedValue({
      id: 'user-id',
      email: 'admin@amdox.com',
      role: 'TENANT_ADMIN',
    });

    jwtService.sign.mockReturnValue('test-token');

    await expect(
      service.login(
        ' ADMIN@AMDOX.COM ',
        'admin123',
      ),
    ).resolves.toEqual({
      access_token: 'test-token',
      user: {
        sub: 'user-id',
        email: 'admin@amdox.com',
        role: 'TENANT_ADMIN',
        tenantId: 'tenant-id',
      },
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'admin@amdox.com',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-id',
    });
  });
});