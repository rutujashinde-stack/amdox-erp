import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../generated/prisma/client';
import {
  ApplyLeaveDto,
  CreateEmployeeDto,
  ProcessPayrollDto,
} from './dto/hr.dto';
import { HrService } from './hr.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('HR')
@ApiBearerAuth()
@Controller('hr')
export class HrController {
  constructor(
    private readonly hrService: HrService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'HR dashboard summary',
  })
  getDashboard(@Request() req: any) {
    return this.hrService.getDashboard(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('employees')
  @ApiOperation({
    summary: 'Create employee',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    examples: {
      employee: {
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '9876543210',
          department: 'IT',
          position: 'Software Engineer',
          salary: 50000,
          startDate: '2026-07-06',
          status: 'ACTIVE',
        },
      },
    },
  })
  createEmployee(
    @Request() req: any,
    @Body() body: CreateEmployeeDto,
  ) {
    return this.hrService.createEmployee(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('employees')
  @ApiOperation({
    summary: 'Get all employees',
  })
  getEmployees(@Request() req: any) {
    return this.hrService.getEmployees(
      req.user.tenantId,
    );
  }

  @Roles(
    Role.SUPER_ADMIN,
    Role.TENANT_ADMIN,
    Role.MANAGER,
  )
  @Post('payroll/process')
  @ApiOperation({
    summary: 'Process payroll',
  })
  @ApiBody({
    type: ProcessPayrollDto,
    examples: {
      payroll: {
        value: {
          period: '2026-07',
        },
      },
    },
  })
  processPayroll(
    @Request() req: any,
    @Body() body: ProcessPayrollDto,
  ) {
    return this.hrService.processPayroll(
      req.user.tenantId,
      body.period,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('payroll')
  @ApiOperation({
    summary: 'Get payroll records',
  })
  getPayroll(@Request() req: any) {
    return this.hrService.getPayrolls(
      req.user.tenantId,
    );
  }

  @Post('leaves')
  @ApiOperation({
    summary: 'Apply leave',
  })
  @ApiBody({
    type: ApplyLeaveDto,
    examples: {
      leave: {
        value: {
          employeeId:
            'paste-employee-uuid-here',
          type: 'SICK',
          startDate: '2026-07-10',
          endDate: '2026-07-12',
          reason: 'Medical appointment',
        },
      },
    },
  })
  applyLeave(
    @Request() req: any,
    @Body() body: ApplyLeaveDto,
  ) {
    return this.hrService.applyLeave(
      req.user.tenantId,
      body,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('leaves')
  @ApiOperation({
    summary: 'Get leave requests',
  })
  getLeaves(@Request() req: any) {
    return this.hrService.getLeaves(
      req.user.tenantId,
    );
  }
}