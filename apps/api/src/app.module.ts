import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { HealthModule } from './health/health.module';
import { HrModule } from './hr/hr.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupplyChainModule } from './supply-chain/supply-chain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    FinanceModule,
    HrModule,
    SupplyChainModule,
    AuditModule,
    NotificationsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}