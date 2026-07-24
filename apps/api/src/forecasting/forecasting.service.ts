import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PredictDemandDto,
  TrainForecastDto,
} from './dto/forecast.dto';

@Injectable()
export class ForecastingService {
  private readonly mlServiceUrl: string;

  constructor(configService: ConfigService) {
    this.mlServiceUrl = (
      configService.get<string>('ML_SERVICE_URL') ||
      'https://amdox-erp-ml.onrender.com'
    ).replace(/\/+$/, '');
  }

  private async request(
    path: string,
    options?: RequestInit,
  ) {
    try {
      const response = await fetch(
        `${this.mlServiceUrl}${path}`,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new BadGatewayException({
          message:
            'The demand forecasting service rejected the request.',
          mlServiceResponse: result,
        });
      }

      return result;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException(
        'The demand forecasting service is unavailable.',
      );
    }
  }

  getHealth() {
    return this.request('/health');
  }

  train(body: TrainForecastDto) {
    return this.request('/train', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  predict(body: PredictDemandDto) {
    return this.request('/predict', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}