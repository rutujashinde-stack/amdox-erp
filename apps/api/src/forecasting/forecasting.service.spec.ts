import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ForecastingService } from './forecasting.service';

describe('ForecastingService', () => {
  let service: ForecastingService;
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(async () => {
    fetchMock = jest.spyOn(global, 'fetch');

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ForecastingService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(
                'https://ml.example.com',
              ),
            },
          },
        ],
      }).compile();

    service =
      module.get<ForecastingService>(
        ForecastingService,
      );
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('should return ML service health', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
      }),
    } as Response);

    await expect(
      service.getHealth(),
    ).resolves.toEqual({
      status: 'ok',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://ml.example.com/health',
      expect.any(Object),
    );
  });

  it('should forward prediction requests', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        sku: 'LAPTOP-001',
        horizonDays: 7,
      }),
    } as Response);

    await service.predict({
      sku: 'LAPTOP-001',
      horizon_days: 7,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://ml.example.com/predict',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('should report an unavailable ML service', async () => {
    fetchMock.mockRejectedValue(
      new Error('Network error'),
    );

    await expect(
      service.getHealth(),
    ).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});