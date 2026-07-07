import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'C:/Users/rutuja shinde/amdox-erp/packages/node_modules/.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: 'postgresql://amdox:amdox123@127.0.0.1:5433/amdox_erp',
});

const prismaClient = new PrismaClient({ adapter });

@Injectable()
export class PrismaService {
  public user = prismaClient.user;
  public tenant = prismaClient.tenant;
  public account = prismaClient.account;
  public transaction = prismaClient.transaction;
  public journalLine = prismaClient.journalLine;
  public invoice = prismaClient.invoice;
  public employee = prismaClient.employee;
  public payroll = prismaClient.payroll;
  public leave = prismaClient.leave;
  public vendor = prismaClient.vendor;
  public purchaseOrder = prismaClient.purchaseOrder;
  public poItem = prismaClient.pOItem;
  public inventoryItem = prismaClient.inventoryItem;

  async onModuleInit() {
    await prismaClient.$connect();
  }

  async onModuleDestroy() {
    await prismaClient.$disconnect();
  }
}