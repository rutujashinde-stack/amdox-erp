import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SupplyChainController } from './supply-chain.controller';
import { SupplyChainService } from './supply-chain.service';

describe('SupplyChainController', () => {
  let controller: SupplyChainController;

  const supplyChainService = {
    getDashboard: jest.fn(),
    createVendor: jest.fn(),
    getVendors: jest.fn(),
    createPurchaseOrder: jest.fn(),
    getPurchaseOrders: jest.fn(),
    createInventoryItem: jest.fn(),
    getInventory: jest.fn(),
    getLowStockItems: jest.fn(),
    updateInventoryItem: jest.fn(),
    deleteInventoryItem: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [SupplyChainController],
        providers: [
          {
            provide: SupplyChainService,
            useValue: supplyChainService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: () => true })
        .compile();

    controller =
      module.get<SupplyChainController>(
        SupplyChainController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a vendor for the authenticated tenant', async () => {
    const request = {
      user: {
        tenantId: 'tenant-id',
        sub: 'user-id',
      },
    };

    const body = {
      name: 'ABC Suppliers',
      email: 'vendor@example.com',
      phone: '9876543210',
      address: 'Pune, Maharashtra',
    };

    await controller.createVendor(request, body);

    expect(
      supplyChainService.createVendor,
    ).toHaveBeenCalledWith(
      'tenant-id',
      body,
      'user-id',
    );
  });
});