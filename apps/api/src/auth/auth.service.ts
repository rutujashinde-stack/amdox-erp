import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const validEmail = this.configService
      .getOrThrow<string>('DEMO_ADMIN_EMAIL')
      .trim()
      .toLowerCase();

    const validPassword =
      this.configService.getOrThrow<string>(
        'DEMO_ADMIN_PASSWORD',
      );

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (
      cleanEmail !== validEmail ||
      cleanPassword !== validPassword
    ) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const tenant = await this.prisma.tenant.upsert({
      where: {
        slug: 'amdox-demo',
      },
      update: {},
      create: {
        name: 'Amdox Demo Company',
        slug: 'amdox-demo',
      },
    });

    const user = await this.prisma.user.upsert({
      where: {
        email: validEmail,
      },
      update: {
        name: 'Amdox Admin',
        role: 'TENANT_ADMIN',
        tenantId: tenant.id,
        deletedAt: null,
      },
      create: {
        email: validEmail,
        name: 'Amdox Admin',
        role: 'TENANT_ADMIN',
        tenantId: tenant.id,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}