import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  AuditModule,
  NotificationEvent,
} from '../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createEmployee(
    tenantId: string,
    data: any,
    userId?: string,
  ) {
    try {
      if (
        !data.firstName ||
        !data.lastName ||
        !data.email ||
        !data.department ||
        !data.position ||
        data.salary === undefined ||
        !data.startDate
      ) {
        throw new BadRequestException(
          'Please provide all employee details.',
        );
      }

      const salary = Number(data.salary);
      const startDate = new Date(data.startDate);

      if (!Number.isFinite(salary) || salary < 0) {
        throw new BadRequestException(
          'Salary must be a valid positive number.',
        );
      }

      if (Number.isNaN(startDate.getTime())) {
        throw new BadRequestException(
          'Start date is invalid.',
        );
      }

      const normalizedEmail = data.email
        .trim()
        .toLowerCase();

      const existingEmployee =
        await this.prisma.employee.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

      if (existingEmployee) {
        throw new ConflictException(
          'An employee with this email address already exists.',
        );
      }

      const count = await this.prisma.employee.count({
        where: {
          tenantId,
        },
      });

      const tenantPrefix = tenantId
        .replace(/-/g, '')
        .slice(0, 6)
        .toUpperCase();

      const employeeCode = `EMP-${tenantPrefix}-${String(
        count + 1,
      ).padStart(4, '0')}`;

      const employee =
        await this.prisma.employee.create({
          data: {
            employeeCode,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: normalizedEmail,
            phone: data.phone?.trim() || null,
            department: data.department.trim(),
            position: data.position.trim(),
            salary,
            startDate,
            status: data.status || 'ACTIVE',
            tenantId,
          },
        });

      await this.auditService.createLog({
        tenantId,
        userId,
        module: AuditModule.HR,
        action: AuditAction.CREATE,
        entityType: 'Employee',
        entityId: employee.id,
        description: `Employee ${employee.employeeCode} was created.`,
        newValues: {
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          salary: Number(employee.salary),
          startDate:
            employee.startDate.toISOString(),
          status: employee.status,
        },
        metadata: {
          source: 'HR Employee Management',
        },
      });

      await this.notificationsService.createNotification({
        tenantId,
        userId,
        event: NotificationEvent.EMPLOYEE_CREATED,
        title: 'Employee created',
        message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) was added to ${employee.department}.`,
        data: {
          entityType: 'Employee',
          entityId: employee.id,
          href: '/hr/employees',
        },
      });

      return employee;
    } catch (error: any) {
      console.error('CREATE EMPLOYEE ERROR:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error?.code === 'P2002') {
        const fields = Array.isArray(
          error?.meta?.target,
        )
          ? error.meta.target.join(', ')
          : 'unique field';

        throw new ConflictException(
          `An employee with the same ${fields} already exists.`,
        );
      }

      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'The employee could not be linked to the selected tenant.',
        );
      }

      throw new InternalServerErrorException(
        'Employee could not be created. Check the API logs for details.',
      );
    }
  }

  async getEmployees(tenantId: string) {
    return this.prisma.employee.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async processPayroll(
    tenantId: string,
    period: string,
    userId?: string,
  ) {
    if (!period?.trim()) {
      throw new BadRequestException(
        'Payroll period is required.',
      );
    }

    const normalizedPeriod = period.trim();

    const employees =
      await this.prisma.employee.findMany({
        where: {
          tenantId,
          status: 'ACTIVE',
          deletedAt: null,
        },
      });

    if (employees.length === 0) {
      throw new BadRequestException(
        'No active employees were found for payroll processing.',
      );
    }

    const payrolls = await Promise.all(
      employees.map(async (employee) => {
        const grossSalary = Number(employee.salary);
        const tax = grossSalary * 0.2;
        const deductions = grossSalary * 0.05;
        const netSalary =
          grossSalary - tax - deductions;

        return this.prisma.payroll.create({
          data: {
            employeeId: employee.id,
            period: normalizedPeriod,
            grossSalary,
            tax,
            deductions,
            netSalary,
            status: 'PROCESSED',
            tenantId,
          },
        });
      }),
    );

    const totalGross = payrolls.reduce(
      (sum, payroll) =>
        sum + Number(payroll.grossSalary),
      0,
    );

    const totalNet = payrolls.reduce(
      (sum, payroll) =>
        sum + Number(payroll.netSalary),
      0,
    );

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.HR,
      action: AuditAction.PROCESS,
      entityType: 'PayrollRun',
      entityId: normalizedPeriod,
      description: `Payroll was processed for ${payrolls.length} employees for period ${normalizedPeriod}.`,
      newValues: {
        period: normalizedPeriod,
        totalEmployees: payrolls.length,
        totalGross,
        totalNet,
        payrollIds: payrolls.map(
          (payroll) => payroll.id,
        ),
      },
      metadata: {
        source: 'HR Payroll Engine',
      },
    });

    await this.notificationsService.createNotification({
      tenantId,
      userId,
      event: NotificationEvent.PAYROLL_PROCESSED,
      title: 'Payroll processed',
      message: `Payroll for ${normalizedPeriod} was processed for ${payrolls.length} employees.`,
      data: {
        entityType: 'PayrollRun',
        entityId: normalizedPeriod,
        href: '/hr/payroll',
        totalEmployees: payrolls.length,
        totalGross,
        totalNet,
      },
    });

    return {
      period: normalizedPeriod,
      totalEmployees: payrolls.length,
      totalGross,
      totalNet,
      payrolls,
    };
  }

  async getPayrolls(tenantId: string) {
    return this.prisma.payroll.findMany({
      where: {
        tenantId,
      },
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async applyLeave(
    tenantId: string,
    data: any,
    userId?: string,
  ) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (
      !data.employeeId ||
      !data.type ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new BadRequestException(
        'Please provide valid leave details.',
      );
    }

    if (endDate < startDate) {
      throw new BadRequestException(
        'Leave end date cannot be before the start date.',
      );
    }

    const employee =
      await this.prisma.employee.findFirst({
        where: {
          id: data.employeeId,
          tenantId,
          deletedAt: null,
        },
      });

    if (!employee) {
      throw new BadRequestException(
        'Employee was not found.',
      );
    }

    const leave = await this.prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate,
        endDate,
        reason: data.reason?.trim() || null,
        status: data.status || 'PENDING',
        tenantId,
      },
    });

    await this.auditService.createLog({
      tenantId,
      userId,
      module: AuditModule.HR,
      action: AuditAction.CREATE,
      entityType: 'Leave',
      entityId: leave.id,
      description: `Leave request was created for employee ${employee.employeeCode}.`,
      newValues: {
        employeeId: leave.employeeId,
        employeeCode: employee.employeeCode,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        type: leave.type,
        startDate: leave.startDate.toISOString(),
        endDate: leave.endDate.toISOString(),
        reason: leave.reason,
        status: leave.status,
      },
      metadata: {
        source: 'HR Leave Management',
      },
    });

    await this.notificationsService.createNotification({
      tenantId,
      userId,
      event: NotificationEvent.LEAVE_CREATED,
      title: 'Leave request created',
      message: `${employee.firstName} ${employee.lastName} submitted a ${leave.type} leave request.`,
      data: {
        entityType: 'Leave',
        entityId: leave.id,
        href: '/hr/leaves',
        employeeId: employee.id,
      },
    });

    return leave;
  }

  async getLeaves(tenantId: string) {
    return this.prisma.leave.findMany({
      where: {
        tenantId,
      },
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDashboard(tenantId: string) {
    const [
      totalEmployees,
      totalPayrolls,
      pendingLeaves,
      approvedLeaves,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),

      this.prisma.payroll.count({
        where: {
          tenantId,
        },
      }),

      this.prisma.leave.count({
        where: {
          tenantId,
          status: 'PENDING',
        },
      }),

      this.prisma.leave.count({
        where: {
          tenantId,
          status: 'APPROVED',
        },
      }),
    ]);

    return {
      totalEmployees,
      totalPayrolls,
      pendingLeaves,
      approvedLeaves,
    };
  }
}