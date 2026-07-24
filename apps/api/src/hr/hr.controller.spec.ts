import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

describe('HrController', () => {
  let controller: HrController;

  const hrService = {
    getDashboard: jest.fn(),
    createEmployee: jest.fn(),
    getEmployees: jest.fn(),
    processPayroll: jest.fn(),
    getPayrolls: jest.fn(),
    applyLeave: jest.fn(),
    getLeaves: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [HrController],
        providers: [
          {
            provide: HrService,
            useValue: hrService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: () => true })
        .compile();

    controller =
      module.get<HrController>(HrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an employee for the authenticated tenant', async () => {
    const request = {
      user: {
        tenantId: 'tenant-id',
        sub: 'user-id',
      },
    };

    const body = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      department: 'IT',
      position: 'Developer',
      salary: 50000,
      startDate: '2026-07-01',
      status: 'ACTIVE',
    };

    hrService.createEmployee.mockResolvedValue({
      id: 'employee-id',
      ...body,
    });

    await controller.createEmployee(
      request,
      body,
    );

    expect(
      hrService.createEmployee,
    ).toHaveBeenCalledWith(
      'tenant-id',
      body,
      'user-id',
    );
  });
});