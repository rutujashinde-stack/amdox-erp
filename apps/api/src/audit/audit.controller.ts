import {
  Controller,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AuditAction,
  AuditModule,
} from '../generated/prisma/client';
import { AuditService } from './audit.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId?: string;
    sub?: string;
    tenantId: string;
    email?: string;
    role?: string;
  };
}

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(
    @Req() request: AuthenticatedRequest,
    @Query('module') module?: AuditModule,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditService.getLogs({
      tenantId: request.user.tenantId,
      module,
      action,
      entityType,
      entityId,
      userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get(':id')
  async getLogById(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.auditService.getLogById(
      request.user.tenantId,
      id,
    );
  }
}