import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  getLiveness() {
    return {
      status: 'ok',
      service: 'amdox-erp-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  async getDatabaseHealth() {
    const startedAt = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        database: 'connected',
        responseTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getReadiness() {
    const database = await this.getDatabaseHealth();

    return {
      status: 'ready',
      service: 'amdox-erp-api',
      checks: {
        database: database.status,
      },
      timestamp: new Date().toISOString(),
    };
  }
}