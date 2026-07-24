import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  @Get('live')
  @ApiOperation({
    summary: 'Check whether the API process is alive',
  })
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({
    summary:
      'Check whether the API is ready to serve traffic',
  })
  getReadiness() {
    return this.healthService.getReadiness();
  }

  @Get('db')
  @ApiOperation({
    summary: 'Check the database connection',
  })
  getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}