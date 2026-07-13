import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(
    tenantId: string,
    data: {
      code: string;
      name: string;
      type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
      balance?: number;
    },
  ) {
    return this.prisma.account.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        balance: data.balance ?? 0,
        tenantId,
      },
    });
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
  ) {
    if (!data.description?.trim()) {
      throw new BadRequestException('Transaction description is required.');
    }

    if (!data.date || Number.isNaN(new Date(data.date).getTime())) {
      throw new BadRequestException('A valid transaction date is required.');
    }

    if (!data.lines || data.lines.length === 0) {
      throw new BadRequestException('Transaction lines are required.');
    }

    for (const line of data.lines) {
      if (!line.debitAccountId || !line.creditAccountId) {
        throw new BadRequestException(
          'Debit and credit accounts are required.',
        );
      }

      if (line.debitAccountId === line.creditAccountId) {
        throw new BadRequestException(
          'Debit and credit accounts must be different.',
        );
      }

      if (!Number.isFinite(Number(line.amount)) || Number(line.amount) <= 0) {
        throw new BadRequestException(
          'Transaction amount must be greater than zero.',
        );
      }

      const [debitAccount, creditAccount] = await Promise.all([
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

    return this.prisma.transaction.create({
      data: {
        reference,
        description: data.description.trim(),
        date: new Date(data.date),
        tenantId,
        lines: {
          create: data.lines.map((line) => ({
            debitAccountId: line.debitAccountId,
            creditAccountId: line.creditAccountId,
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
  ) {
    const amount = Number(data.amount);
    const dueDate = new Date(data.dueDate);

    if (!['PAYABLE', 'RECEIVABLE'].includes(data.type)) {
      throw new BadRequestException('Invalid invoice type.');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'Invoice amount must be greater than zero.',
      );
    }

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException('A valid due date is required.');
    }

    const number = `INV-${Date.now()}`;

    return this.prisma.invoice.create({
      data: {
        number,
        type: data.type,
        amount,
        currency: data.currency || 'INR',
        dueDate,
        tenantId,
      },
    });
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
    const [accounts, invoices, totalTransactions] = await Promise.all([
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
      .filter((account) => account.type === 'ASSET')
      .reduce((sum, account) => sum + Number(account.balance), 0);

    const totalLiabilities = accounts
      .filter((account) => account.type === 'LIABILITY')
      .reduce((sum, account) => sum + Number(account.balance), 0);

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