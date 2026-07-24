import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class DemandPointDto {
  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  demand: number;
}

export class TrainForecastDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  sku: string;

  @IsArray()
  @ArrayMinSize(7)
  @ValidateNested({ each: true })
  @Type(() => DemandPointDto)
  history: DemandPointDto[];
}

export class PredictDemandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  sku: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  horizon_days: number;
}