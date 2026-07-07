import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplyChainService {
  constructor(private prisma: PrismaService) {}

  async createVendor(tenantId: string, data: any) {
    return this.prisma.vendor.create({ data: { ...data, tenantId } });
  }

  async getVendors(tenantId: string) {
    return this.prisma.vendor.findMany({ where: { tenantId } });
  }

  async createPurchaseOrder(tenantId: string, data: any) {
    const poNumber = `PO-${Date.now()}`;
    const totalAmount = data.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: data.vendorId,
        totalAmount,
        tenantId,
        items: {
          create: data.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        vendor: true,
      },
    });
  }

  async getPurchaseOrders(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: { items: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInventoryItem(tenantId: string, data: any) {
    return this.prisma.inventoryItem.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async getInventory(tenantId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { tenantId },
    });
  }

  async getLowStockItems(tenantId: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        quantity: { lte: 10 },
      },
    });
  }

  async updateInventoryItem(
    tenantId: string,
    id: string,
    data: any,
  ) {
    return this.prisma.inventoryItem.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async deleteInventoryItem(
    tenantId: string,
    id: string,
  ) {
    return this.prisma.inventoryItem.delete({
      where: {
        id,
        tenantId,
      },
    });
  }

  async getDashboard(tenantId: string) {
    const [vendors, orders, inventory, lowStock] = await Promise.all([
      this.prisma.vendor.count({ where: { tenantId } }),
      this.prisma.purchaseOrder.count({ where: { tenantId } }),
      this.prisma.inventoryItem.count({ where: { tenantId } }),
      this.prisma.inventoryItem.count({
        where: {
          tenantId,
          quantity: { lte: 10 },
        },
      }),
    ]);

    return {
      totalVendors: vendors,
      totalOrders: orders,
      totalInventoryItems: inventory,
      lowStockAlerts: lowStock,
    };
  }
}