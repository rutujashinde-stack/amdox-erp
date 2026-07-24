import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';

describe('ForecastingController', () => {
  let controller: ForecastingController;

  const forecastingService = {
    getHealth: jest.fn(),
    train: jest.fn(),
    predict: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ForecastingController],
        providers: [
          {
            provide: ForecastingService,
            useValue: forecastingService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: () => true })
        .compile();

    controller =
      module.get<ForecastingController>(
        ForecastingController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should forward prediction data', async () => {
    const body = {
      sku: 'LAPTOP-001',
      horizon_days: 7,
    };

    forecastingService.predict.mockResolvedValue({
      sku: 'LAPTOP-001',
    });

    await controller.predict(body);

    expect(
      forecastingService.predict,
    ).toHaveBeenCalledWith(body);
  });
});