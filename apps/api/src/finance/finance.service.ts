import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  AuditModule,
  NotificationEvent,
} from '../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createAccount(
    tenantId: string,
    data: {
      code: string;
      name: string;
      type:
        | 'ASSET'
        | 'LIABILITY'
        | 'EQUITY'
        | 'REVENUE'
        | 'EXPENSE';
      balance?: number;
    },
    userId?: string,
  ) {
    if (!data.code?.trim() || !data.name?.trim()) {
      throw new BadRequestException(
        'Account code and name are required.',
      );
    }

    const balance = Number(data.balance ?? 0);

    if (!Number.isFinite(balance)) {
      throw new BadRequestException(
        'Account balance must be a valid number.',
      );
    }

    const account = await this.prisma.account.create({
      data: {
        code: data.code.trim(),
        name: data.name.trim(),
        type: data.type,
        balance,
        tenantId,
      },
    });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.FINANCE,
      action: AuditAction.CREATE,
      entityType: 'Account',
      entityId: account.id,
      description: `Finance account ${account.code} was created.`,
      newValues: {
        code: account.code,
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
      },
      metadata: {
        source: 'Finance Account Management',
      },
    });

    await this.notificationsService.createNotification({
      tenantId,
      userId,
      event: NotificationEvent.ACCOUNT_CREATED,
      title: 'Finance account created',
      message: `${account.name} (${account.code}) was added to the chart of accounts.`,
      data: {
        entityType: 'Account',
        entityId: account.id,
        href: '/finance',
      },
    });

    return account;
  }

  async getAccounts(tenantId: string) {
    return this.prisma.account.findMany({
      where: { tenantId },
      orderBy: { code: 'asc' },
    });
  }

  async createTransaction(
    tenantId: string,
    data: {
      description: string;
      date: string;
      lines: {
        debitAccountId: string;
        creditAccountId: string;
        amount: number;
        currency?: string;
      }[];
    },
    userId?: string,
  ) {
    if (!data.description?.trim()) {
      throw new BadRequestException(
        'Transaction description is required.',
      );
    }

    const transactionDate = new Date(data.date);

    if (
      !data.date ||
      Number.isNaN(transactionDate.getTime())
    ) {
      throw new BadRequestException(
        'A valid transaction date is required.',
      );
    }

    if (!data.lines || data.lines.length === 0) {
      throw new BadRequestException(
        'Transaction lines are required.',
      );
    }

    for (const line of data.lines) {
      if (
        !line.debitAccountId ||
        !line.creditAccountId
      ) {
        throw new BadRequestException(
          'Debit and credit accounts are required.',
        );
      }

      if (
        line.debitAccountId === line.creditAccountId
      ) {
        throw new BadRequestException(
          'Debit and credit accounts must be different.',
        );
      }

      const amount = Number(line.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException(
          'Transaction amount must be greater than zero.',
        );
      }

      const [debitAccount, creditAccount] =
        await Promise.all([
          this.prisma.account.findFirst({
            where: {
              id: line.debitAccountId,
              tenantId,
            },
          }),
          this.prisma.account.findFirst({
            where: {
              id: line.creditAccountId,
              tenantId,
            },
          }),
        ]);

      if (!debitAccount || !creditAccount) {
        throw new BadRequestException(
          'One or more selected accounts could not be found.',
        );
      }
    }

    const reference = `TXN-${Date.now()}`;

    const transaction =
      await this.prisma.transaction.create({
        data: {
          reference,
          description: data.description.trim(),
          date: transactionDate,
          tenantId,
          lines: {
            create: data.lines.map((line) => ({
              debitAccountId: line.debitAccountId,
              creditAccountId:
                line.creditAccountId,
              amount: Number(line.amount),
              currency: line.currency || 'INR',
            })),
          },
        },
        include: {
          lines: {
            include: {
              debitAccount: true,
              creditAccount: true,
            },
          },
        },
      });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.FINANCE,
      action: AuditAction.CREATE,
      entityType: 'Transaction',
      entityId: transaction.id,
      description: `Finance transaction ${transaction.reference} was recorded.`,
      newValues: {
        reference: transaction.reference,
        description: transaction.description,
        date: transaction.date.toISOString(),
        lines: transaction.lines.map((line) => ({
          debitAccountId: line.debitAccountId,
          debitAccountCode:
            line.debitAccount?.code ?? null,
          debitAccountName:
            line.debitAccount?.name ?? null,
          creditAccountId:
            line.creditAccountId,
          creditAccountCode:
            line.creditAccount?.code ?? null,
          creditAccountName:
            line.creditAccount?.name ?? null,
          amount: Number(line.amount),
          currency: line.currency,
        })),
      },
      metadata: {
        source: 'Finance Journal Entry',
      },
    });

    await this.notificationsService.createNotification({
      tenantId,
      userId,
      event: NotificationEvent.TRANSACTION_CREATED,
      title: 'Finance transaction recorded',
      message: `${transaction.reference}: ${transaction.description}`,
      data: {
        entityType: 'Transaction',
        entityId: transaction.id,
        href: '/finance/transactions',
      },
    });

    return transaction;
  }

  async getTransactions(tenantId: string) {
    return this.prisma.transaction.findMany({
      where: { tenantId },
      include: {
        lines: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createInvoice(
    tenantId: string,
    data: {
      type: 'PAYABLE' | 'RECEIVABLE';
      amount: number;
      currency?: string;
      dueDate: string;
    },
    userId?: string,
  ) {
    const amount = Number(data.amount);
    const dueDate = new Date(data.dueDate);

    if (
      !['PAYABLE', 'RECEIVABLE'].includes(data.type)
    ) {
      throw new BadRequestException(
        'Invalid invoice type.',
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'Invoice amount must be greater than zero.',
      );
    }

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException(
        'A valid due date is required.',
      );
    }

    const number = `INV-${Date.now()}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        type: data.type,
        amount,
        currency: data.currency || 'INR',
        dueDate,
        tenantId,
      },
    });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.FINANCE,
      action: AuditAction.CREATE,
      entityType: 'Invoice',
      entityId: invoice.id,
      description: `Invoice ${invoice.number} was created.`,
      newValues: {
        number: invoice.number,
        type: invoice.type,
        status: invoice.status,
        amount: Number(invoice.amount),
        currency: invoice.currency,
        dueDate: invoice.dueDate.toISOString(),
      },
      metadata: {
        source: 'Finance Invoice Management',
      },
    });

    await this.notificationsService.createNotification({
      tenantId,
      userId,
      event: NotificationEvent.INVOICE_CREATED,
      title: 'Invoice created',
      message: `${invoice.number} for ${
        invoice.currency
      } ${Number(invoice.amount).toLocaleString(
        'en-IN',
      )} was created.`,
      data: {
        entityType: 'Invoice',
        entityId: invoice.id,
        href: '/finance/invoices',
      },
    });

    return invoice;
  }

  async getInvoices(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDashboard(tenantId: string) {
    const [accounts, invoices, totalTransactions] =
      await Promise.all([
        this.prisma.account.findMany({
          where: { tenantId },
        }),
        this.prisma.invoice.findMany({
          where: { tenantId },
        }),
        this.prisma.transaction.count({
          where: { tenantId },
        }),
      ]);

    const totalAssets = accounts
      .filter(
        (account) => account.type === 'ASSET',
      )
      .reduce(
        (sum, account) =>
          sum + Number(account.balance),
        0,
      );

    const totalLiabilities = accounts
      .filter(
        (account) =>
          account.type === 'LIABILITY',
      )
      .reduce(
        (sum, account) =>
          sum + Number(account.balance),
        0,
      );

    const pendingInvoices = invoices.filter(
      (invoice) => invoice.status === 'PENDING',
    ).length;

    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === 'PAID',
    ).length;

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      pendingInvoices,
      paidInvoices,
      totalTransactions,
    };
  }
}