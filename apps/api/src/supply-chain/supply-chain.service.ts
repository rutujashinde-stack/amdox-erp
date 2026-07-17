import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  AuditModule,
} from '../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplyChainService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createVendor(
    tenantId: string,
    data: any,
    userId?: string,
  ) {
    if (!data.name?.trim() || !data.email?.trim()) {
      throw new BadRequestException(
        'Vendor name and email are required.',
      );
    }

    const vendor = await this.prisma.vendor.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        tenantId,
      },
    });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.SUPPLY_CHAIN,
      action: AuditAction.CREATE,
      entityType: 'Vendor',
      entityId: vendor.id,
      description: `Vendor ${vendor.name} was created.`,
      newValues: {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
      },
      metadata: {
        source: 'Supply Chain Vendor Management',
      },
    });

    return vendor;
  }

  async getVendors(tenantId: string) {
    return this.prisma.vendor.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createPurchaseOrder(
    tenantId: string,
    data: any,
    userId?: string,
  ) {
    if (!data.vendorId) {
      throw new BadRequestException(
        'Vendor is required.',
      );
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException(
        'At least one purchase-order item is required.',
      );
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: {
        id: data.vendorId,
        tenantId,
      },
    });

    if (!vendor) {
      throw new NotFoundException(
        'The selected vendor was not found.',
      );
    }

    const normalizedItems = data.items.map((item: any) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!item.productName?.trim()) {
        throw new BadRequestException(
          'Every purchase-order item requires a product name.',
        );
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'Item quantity must be a positive whole number.',
        );
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new BadRequestException(
          'Item unit price must be a valid positive number.',
        );
      }

      return {
        productName: item.productName.trim(),
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      };
    });

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const poNumber = `PO-${Date.now()}`;

    const purchaseOrder =
      await this.prisma.purchaseOrder.create({
        data: {
          poNumber,
          vendorId: vendor.id,
          totalAmount,
          tenantId,
          status: data.status || 'DRAFT',
          items: {
            create: normalizedItems,
          },
        },
        include: {
          items: true,
          vendor: true,
        },
      });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.SUPPLY_CHAIN,
      action: AuditAction.CREATE,
      entityType: 'PurchaseOrder',
      entityId: purchaseOrder.id,
      description: `Purchase order ${purchaseOrder.poNumber} was created for vendor ${vendor.name}.`,
      newValues: {
        poNumber: purchaseOrder.poNumber,
        vendorId: purchaseOrder.vendorId,
        vendorName: purchaseOrder.vendor.name,
        status: purchaseOrder.status,
        totalAmount: Number(purchaseOrder.totalAmount),
        items: purchaseOrder.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      },
      metadata: {
        source: 'Supply Chain Purchase Order Management',
      },
    });

    return purchaseOrder;
  }

  async getPurchaseOrders(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
      },
      include: {
        items: true,
        vendor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createInventoryItem(
    tenantId: string,
    data: any,
    userId?: string,
  ) {
    if (!data.sku?.trim() || !data.name?.trim()) {
      throw new BadRequestException(
        'SKU and product name are required.',
      );
    }

    const quantity = Number(data.quantity ?? 0);
    const reorderPoint = Number(data.reorderPoint ?? 10);
    const unitPrice = Number(data.unitPrice);

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new BadRequestException(
        'Quantity must be a valid non-negative whole number.',
      );
    }

    if (!Number.isInteger(reorderPoint) || reorderPoint < 0) {
      throw new BadRequestException(
        'Reorder point must be a valid non-negative whole number.',
      );
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new BadRequestException(
        'Unit price must be a valid positive number.',
      );
    }

    const inventoryItem =
      await this.prisma.inventoryItem.create({
        data: {
          sku: data.sku.trim(),
          name: data.name.trim(),
          quantity,
          reorderPoint,
          unitPrice,
          tenantId,
        },
      });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.SUPPLY_CHAIN,
      action: AuditAction.CREATE,
      entityType: 'InventoryItem',
      entityId: inventoryItem.id,
      description: `Inventory item ${inventoryItem.sku} was created.`,
      newValues: {
        sku: inventoryItem.sku,
        name: inventoryItem.name,
        quantity: inventoryItem.quantity,
        reorderPoint: inventoryItem.reorderPoint,
        unitPrice: Number(inventoryItem.unitPrice),
      },
      metadata: {
        source: 'Supply Chain Inventory Management',
      },
    });

    return inventoryItem;
  }

  async getInventory(tenantId: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLowStockItems(tenantId: string) {
    const inventory =
      await this.prisma.inventoryItem.findMany({
        where: {
          tenantId,
        },
        orderBy: {
          quantity: 'asc',
        },
      });

    return inventory.filter(
      (item) => item.quantity <= item.reorderPoint,
    );
  }

  async updateInventoryItem(
    tenantId: string,
    id: string,
    data: any,
    userId?: string,
  ) {
    const existingItem =
      await this.prisma.inventoryItem.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!existingItem) {
      throw new NotFoundException(
        'Inventory item was not found.',
      );
    }

    const updateData: {
      name?: string;
      quantity?: number;
      reorderPoint?: number;
      unitPrice?: number;
    } = {};

    if (data.name !== undefined) {
      if (!String(data.name).trim()) {
        throw new BadRequestException(
          'Product name cannot be empty.',
        );
      }

      updateData.name = String(data.name).trim();
    }

    if (data.quantity !== undefined) {
      const quantity = Number(data.quantity);

      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new BadRequestException(
          'Quantity must be a valid non-negative whole number.',
        );
      }

      updateData.quantity = quantity;
    }

    if (data.reorderPoint !== undefined) {
      const reorderPoint = Number(data.reorderPoint);

      if (
        !Number.isInteger(reorderPoint) ||
        reorderPoint < 0
      ) {
        throw new BadRequestException(
          'Reorder point must be a valid non-negative whole number.',
        );
      }

      updateData.reorderPoint = reorderPoint;
    }

    if (data.unitPrice !== undefined) {
      const unitPrice = Number(data.unitPrice);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new BadRequestException(
          'Unit price must be a valid positive number.',
        );
      }

      updateData.unitPrice = unitPrice;
    }

    const updatedItem =
      await this.prisma.inventoryItem.update({
        where: {
          id,
        },
        data: updateData,
      });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.SUPPLY_CHAIN,
      action: AuditAction.UPDATE,
      entityType: 'InventoryItem',
      entityId: updatedItem.id,
      description: `Inventory item ${updatedItem.sku} was updated.`,
      oldValues: {
        sku: existingItem.sku,
        name: existingItem.name,
        quantity: existingItem.quantity,
        reorderPoint: existingItem.reorderPoint,
        unitPrice: Number(existingItem.unitPrice),
      },
      newValues: {
        sku: updatedItem.sku,
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        reorderPoint: updatedItem.reorderPoint,
        unitPrice: Number(updatedItem.unitPrice),
      },
      metadata: {
        source: 'Supply Chain Inventory Management',
      },
    });

    return updatedItem;
  }

  async deleteInventoryItem(
    tenantId: string,
    id: string,
    userId?: string,
  ) {
    const existingItem =
      await this.prisma.inventoryItem.findFirst({
        where: {
          id,
          tenantId,
        },
      });

    if (!existingItem) {
      throw new NotFoundException(
        'Inventory item was not found.',
      );
    }

    const deletedItem =
      await this.prisma.inventoryItem.delete({
        where: {
          id,
        },
      });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.SUPPLY_CHAIN,
      action: AuditAction.DELETE,
      entityType: 'InventoryItem',
      entityId: existingItem.id,
      description: `Inventory item ${existingItem.sku} was deleted.`,
      oldValues: {
        sku: existingItem.sku,
        name: existingItem.name,
        quantity: existingItem.quantity,
        reorderPoint: existingItem.reorderPoint,
        unitPrice: Number(existingItem.unitPrice),
      },
      metadata: {
        source: 'Supply Chain Inventory Management',
      },
    });

    return deletedItem;
  }

  async getDashboard(tenantId: string) {
    const [
      totalVendors,
      totalPurchaseOrders,
      inventoryItems,
    ] = await Promise.all([
      this.prisma.vendor.count({
        where: {
          tenantId,
        },
      }),

      this.prisma.purchaseOrder.count({
        where: {
          tenantId,
        },
      }),

      this.prisma.inventoryItem.findMany({
        where: {
          tenantId,
        },
        select: {
          quantity: true,
          reorderPoint: true,
        },
      }),
    ]);

    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity <= item.reorderPoint,
    ).length;

    return {
      totalVendors,
      totalPurchaseOrders,
      totalInventoryItems: inventoryItems.length,
      lowStockItems,
    };
  }
}