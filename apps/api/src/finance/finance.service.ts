import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

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
    if (!data.lines || data.lines.length === 0) {
      throw new BadRequestException('Transaction lines are required');
    }

    const reference = `TXN-${Date.now()}`;

    return this.prisma.transaction.create({
      data: {
        reference,
        description: data.description,
        date: new Date(data.date),
        tenantId,
        lines: {
          create: data.lines.map((line) => ({
            debitAccountId: line.debitAccountId,
            creditAccountId: line.creditAccountId,
            amount: line.amount,
            currency: line.currency || 'USD',
          })),
        },
      },
      include: { lines: true },
    });
  }

  async getTransactions(tenantId: string) {
    return this.prisma.transaction.findMany({
      where: { tenantId },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
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
    const number = `INV-${Date.now()}`;

    return this.prisma.invoice.create({
      data: {
        number,
        type: data.type,
        amount: data.amount,
        currency: data.currency || 'USD',
        dueDate: new Date(data.dueDate),
        tenantId,
      },
    });
  }

  async getInvoices(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboard(tenantId: string) {
    const [accounts, invoices, transactions] = await Promise.all([
      this.prisma.account.findMany({ where: { tenantId } }),
      this.prisma.invoice.findMany({ where: { tenantId } }),
      this.prisma.transaction.count({ where: { tenantId } }),
    ]);

    const totalAssets = accounts
      .filter((a) => a.type === 'ASSET')
      .reduce((sum, a) => sum + Number(a.balance), 0);

    const totalLiabilities = accounts
      .filter((a) => a.type === 'LIABILITY')
      .reduce((sum, a) => sum + Number(a.balance), 0);

    const pendingInvoices = invoices.filter((i) => i.status === 'PENDING').length;
    const paidInvoices = invoices.filter((i) => i.status === 'PAID').length;

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      pendingInvoices,
      paidInvoices,
      totalTransactions: transactions,
    };
  }
}