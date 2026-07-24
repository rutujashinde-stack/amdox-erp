import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

describe('FinanceController', () => {
  let controller: FinanceController;

  const financeService = {
    getDashboard: jest.fn(),
    createAccount: jest.fn(),
    getAccounts: jest.fn(),
    createTransaction: jest.fn(),
    getTransactions: jest.fn(),
    createInvoice: jest.fn(),
    getInvoices: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [FinanceController],
        providers: [
          {
            provide: FinanceService,
            useValue: financeService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: () => true })
        .compile();

    controller =
      module.get<FinanceController>(
        FinanceController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an account for the authenticated tenant', async () => {
    const request = {
      user: {
        tenantId: 'tenant-id',
        sub: 'user-id',
      },
    };

    const body = {
      code: '1001',
      name: 'Cash',
      type: 'ASSET' as const,
      balance: 50000,
    };

    financeService.createAccount.mockResolvedValue({
      id: 'account-id',
      ...body,
    });

    await controller.createAccount(
      request,
      body,
    );

    expect(
      financeService.createAccount,
    ).toHaveBeenCalledWith(
      'tenant-id',
      body,
      'user-id',
    );
  });
});
