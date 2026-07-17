import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}