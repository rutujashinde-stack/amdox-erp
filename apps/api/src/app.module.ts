import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
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
    PrismaModule,
    AuthModule,
    FinanceModule,
    HrModule,
    SupplyChainModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}