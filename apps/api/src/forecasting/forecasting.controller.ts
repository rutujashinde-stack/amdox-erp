import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../generated/prisma/client';
import {
  PredictDemandDto,
  TrainForecastDto,
} from './dto/forecast.dto';
import { ForecastingService } from './forecasting.service';

@ApiTags('Demand Forecasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('forecasting')
export class ForecastingController {
  constructor(
    private readonly forecastingService:
      ForecastingService,
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check the ML forecasting service',
  })
  getHealth() {
    return this.forecastingService.getHealth();
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('train')
  @ApiOperation({
    summary: 'Train a demand model for one SKU',
  })
  train(@Body() body: TrainForecastDto) {
    return this.forecastingService.train(body);
  }

  @Post('predict')
  @ApiOperation({
    summary: 'Predict future demand for one SKU',
  })
  predict(@Body() body: PredictDemandDto) {
    return this.forecastingService.predict(body);
  }
}