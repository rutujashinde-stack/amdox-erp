import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FinanceModule } from './finance/finance.module';
import { HrModule } from './hr/hr.module';
import { SupplyChainModule } from './supply-chain/supply-chain.module';

@Module({
  imports: [PrismaModule, AuthModule, FinanceModule, HrModule, SupplyChainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
