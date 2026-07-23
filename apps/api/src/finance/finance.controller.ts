import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../generated/prisma/client';
import { FinanceService } from './finance.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get finance dashboard summary',
  })
  getDashboard(@Request() req: any) {
    return this.financeService.getDashboard(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('accounts')
  @ApiOperation({
    summary: 'Create a chart of accounts entry',
  })
  @ApiBody({
    schema: {
      example: {
        code: '1001',
        name: 'Cash',
        type: 'ASSET',
        balance: 50000,
      },
    },
  })
  createAccount(
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.financeService.createAccount(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'Get all accounts',
  })
  getAccounts(@Request() req: any) {
    return this.financeService.getAccounts(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('transactions')
  @ApiOperation({
    summary: 'Create a journal entry',
  })
  @ApiBody({
    schema: {
      example: {
        description: 'Office Rent Payment',
        date: '2026-07-03',
        lines: [
          {
            debitAccountId:
              'paste-debit-account-id-here',
            creditAccountId:
              'paste-credit-account-id-here',
            amount: 10000,
            currency: 'INR',
          },
        ],
      },
    },
  })
  createTransaction(
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.financeService.createTransaction(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Get all transactions',
  })
  getTransactions(@Request() req: any) {
    return this.financeService.getTransactions(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('invoices')
  @ApiOperation({
    summary: 'Create an invoice',
  })
  @ApiBody({
    schema: {
      example: {
        type: 'RECEIVABLE',
        amount: 15000,
        currency: 'INR',
        dueDate: '2026-07-30',
      },
    },
  })
  createInvoice(
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.financeService.createInvoice(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('invoices')
  @ApiOperation({
    summary: 'Get all invoices',
  })
  getInvoices(@Request() req: any) {
    return this.financeService.getInvoices(
      req.user.tenantId,
    );
  }
}