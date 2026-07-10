import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prismaClient = new PrismaClient({
  adapter,
});

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
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