import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SupplyChainService } from './supply-chain.service';

@ApiTags('Supply Chain')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('supply-chain')
export class SupplyChainController {
  constructor(private supplyChainService: SupplyChainService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Supply chain dashboard' })
  getDashboard(@Request() req) {
    return this.supplyChainService.getDashboard(req.user.tenantId);
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
  createVendor(@Request() req, @Body() body: any) {
    return this.supplyChainService.createVendor(req.user.tenantId, body);
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Get all vendors' })
  getVendors(@Request() req) {
    return this.supplyChainService.getVendors(req.user.tenantId);
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
  createPO(@Request() req, @Body() body: any) {
    return this.supplyChainService.createPurchaseOrder(req.user.tenantId, body);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'Get all purchase orders' })
  getPOs(@Request() req) {
    return this.supplyChainService.getPurchaseOrders(req.user.tenantId);
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
  createInventory(@Request() req, @Body() body: any) {
    return this.supplyChainService.createInventoryItem(req.user.tenantId, body);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory' })
  getInventory(@Request() req) {
    return this.supplyChainService.getInventory(req.user.tenantId);
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
  updateInventory(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.supplyChainService.updateInventoryItem(
      req.user.tenantId,
      id,
      body,
    );
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Delete inventory item' })
  deleteInventory(@Request() req, @Param('id') id: string) {
    return this.supplyChainService.deleteInventoryItem(req.user.tenantId, id);
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStock(@Request() req) {
    return this.supplyChainService.getLowStockItems(req.user.tenantId);
  }
}