import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import {
  CreateInventoryItemDto,
  CreatePurchaseOrderDto,
  CreateVendorDto,
  UpdateInventoryItemDto,
} from './dto/supply-chain.dto';
import { SupplyChainService } from './supply-chain.service';

@ApiTags('Supply Chain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('supply-chain')
export class SupplyChainController {
  constructor(
    private readonly supplyChainService:
      SupplyChainService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Supply chain dashboard',
  })
  getDashboard(@Request() req: any) {
    return this.supplyChainService.getDashboard(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('vendors')
  @ApiOperation({
    summary: 'Create vendor',
  })
  @ApiBody({
    type: CreateVendorDto,
    examples: {
      vendor: {
        value: {
          name: 'ABC Suppliers',
          email: 'vendor@example.com',
          phone: '9876543210',
          address: 'Pune, Maharashtra',
        },
      },
    },
  })
  createVendor(
    @Request() req: any,
    @Body() body: CreateVendorDto,
  ) {
    return this.supplyChainService.createVendor(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('vendors')
  @ApiOperation({
    summary: 'Get all vendors',
  })
  getVendors(@Request() req: any) {
    return this.supplyChainService.getVendors(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('purchase-orders')
  @ApiOperation({
    summary: 'Create purchase order',
  })
  @ApiBody({
    type: CreatePurchaseOrderDto,
    examples: {
      purchaseOrder: {
        value: {
          vendorId: 'paste-vendor-uuid-here',
          items: [
            {
              productName: 'Laptop',
              quantity: 5,
              unitPrice: 50000,
            },
          ],
        },
      },
    },
  })
  createPurchaseOrder(
    @Request() req: any,
    @Body() body: CreatePurchaseOrderDto,
  ) {
    return this.supplyChainService.createPurchaseOrder(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('purchase-orders')
  @ApiOperation({
    summary: 'Get all purchase orders',
  })
  getPurchaseOrders(@Request() req: any) {
    return this.supplyChainService.getPurchaseOrders(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('inventory')
  @ApiOperation({
    summary: 'Add inventory item',
  })
  @ApiBody({
    type: CreateInventoryItemDto,
    examples: {
      inventory: {
        value: {
          sku: 'ITEM-001',
          name: 'Laptop',
          quantity: 10,
          reorderPoint: 5,
          unitPrice: 50000,
        },
      },
    },
  })
  createInventory(
    @Request() req: any,
    @Body() body: CreateInventoryItemDto,
  ) {
    return this.supplyChainService.createInventoryItem(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('inventory')
  @ApiOperation({
    summary: 'Get inventory',
  })
  getInventory(@Request() req: any) {
    return this.supplyChainService.getInventory(
      req.user.tenantId,
    );
  }

  @Get('inventory/low-stock')
  @ApiOperation({
    summary: 'Get low-stock alerts',
  })
  getLowStock(@Request() req: any) {
    return this.supplyChainService.getLowStockItems(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Patch('inventory/:id')
  @ApiOperation({
    summary: 'Update inventory item',
  })
  @ApiBody({
    type: UpdateInventoryItemDto,
    examples: {
      inventoryUpdate: {
        value: {
          name: 'Updated Laptop',
          quantity: 20,
          reorderPoint: 5,
          unitPrice: 52000,
        },
      },
    },
  })
  updateInventory(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateInventoryItemDto,
  ) {
    return this.supplyChainService.updateInventoryItem(
      req.user.tenantId,
      id,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Delete('inventory/:id')
  @ApiOperation({
    summary: 'Delete inventory item',
  })
  deleteInventory(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.supplyChainService.deleteInventoryItem(
      req.user.tenantId,
      id,
      req.user.userId ?? req.user.sub,
    );
  }
}