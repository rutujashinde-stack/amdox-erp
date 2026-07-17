import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SupplyChainController } from './supply-chain.controller';
import { SupplyChainService } from './supply-chain.service';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
  ],
  controllers: [SupplyChainController],
  providers: [SupplyChainService],
})
export class SupplyChainModule {}