import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, password: string) {
    const validEmail = 'admin@amdox.com';
    const validPassword = 'admin123';

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (cleanEmail !== validEmail || cleanPassword !== validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create the demo tenant if it does not already exist
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

    // Create or update the admin user using the real tenant UUID
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