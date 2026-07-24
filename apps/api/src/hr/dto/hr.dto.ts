import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  department: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  position: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salary: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;
}

export class ProcessPayrollDto {
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message:
      'period must use YYYY-MM format, for example 2026-07',
  })
  period: string;
}

export class ApplyLeaveDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  type: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;
}