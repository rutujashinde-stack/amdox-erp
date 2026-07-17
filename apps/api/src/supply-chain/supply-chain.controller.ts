import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupplyChainService } from './supply-chain.service';

@ApiTags('Supply Chain')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('supply-chain')
export class SupplyChainController {
  constructor(
    private readonly supplyChainService: SupplyChainService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Supply chain dashboard' })
  getDashboard(@Request() req: any) {
    return this.supplyChainService.getDashboard(
      req.user.tenantId,
    );
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Create vendor' })
  @ApiBody({
    schema: {
      example: {
        name: 'ABC Suppliers',
        email: 'vendor@example.com',
        phone: '9876543210',
        address: 'Pune, Maharashtra',
      },
    },
  })
  createVendor(
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.supplyChainService.createVendor(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Get all vendors' })
  getVendors(@Request() req: any) {
    return this.supplyChainService.getVendors(
      req.user.tenantId,
    );
  }

  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create purchase order' })
  @ApiBody({
    schema: {
      example: {
        vendorId: 'paste-vendor-id-here',
        items: [
          {
            productName: 'Laptop',
            quantity: 5,
            unitPrice: 50000,
          },
        ],
      },
    },
  })
  createPurchaseOrder(
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.supplyChainService.createPurchaseOrder(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'Get all purchase orders' })
  getPurchaseOrders(@Request() req: any) {
    return this.supplyChainService.getPurchaseOrders(
      req.user.tenantId,
    );
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Add inventory item' })
  @ApiBody({
    schema: {
      example: {
        sku: 'ITEM-001',
        name: 'Laptop',
        quantity: 10,
        reorderPoint: 5,
        unitPrice: 50000,
      },
    },
  })
  createInventory(
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.supplyChainService.createInventoryItem(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory' })
  getInventory(@Request() req: any) {
    return this.supplyChainService.getInventory(
      req.user.tenantId,
    );
  }

  @Patch('inventory/:id')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiBody({
    schema: {
      example: {
        name: 'Updated Laptop',
        quantity: 20,
        reorderPoint: 5,
        unitPrice: 52000,
      },
    },
  })
  updateInventory(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.supplyChainService.updateInventoryItem(
      req.user.tenantId,
      id,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Delete inventory item' })
  deleteInventory(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.supplyChainService.deleteInventoryItem(
      req.user.tenantId,
      id,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStock(@Request() req: any) {
    return this.supplyChainService.getLowStockItems(
      req.user.tenantId,
    );
  }
}