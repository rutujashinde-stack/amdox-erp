import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string, password: string) {
    console.log("🔥 LOGIN FUNCTION HIT");
    console.log("RAW EMAIL:", email);
    console.log("RAW PASSWORD:", password);
    
    const validEmail = 'admin@amdox.com';
    const validPassword = 'admin123';

    console.log('🔥 LOGIN HIT:', { email, password });

    // Trim safety (VERY IMPORTANT for real-world issues)
    const cleanEmail = email?.trim();
    const cleanPassword = password?.trim();

    // Validate credentials
    if (cleanEmail !== validEmail || cleanPassword !== validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT payload
    const payload = {
      sub: 'user-001',
      email: validEmail,
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-001',
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: payload,
    };
  }
}