import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(tenantId: string, data: any) {
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
        throw new BadRequestException('Please provide all employee details.');
      }

      const salary = Number(data.salary);
      const startDate = new Date(data.startDate);

      if (!Number.isFinite(salary) || salary < 0) {
        throw new BadRequestException('Salary must be a valid positive number.');
      }

      if (Number.isNaN(startDate.getTime())) {
        throw new BadRequestException('Start date is invalid.');
      }

      const existingEmployee = await this.prisma.employee.findUnique({
        where: {
          email: data.email.trim().toLowerCase(),
        },
      });

      if (existingEmployee) {
        throw new ConflictException(
          'An employee with this email address already exists.',
        );
      }

      const count = await this.prisma.employee.count({
        where: { tenantId },
      });

      /*
       * employeeCode is globally unique in the Prisma schema.
       * Adding part of tenantId prevents EMP-0001 from conflicting
       * with EMP-0001 belonging to another tenant.
       */
      const tenantPrefix = tenantId.replace(/-/g, '').slice(0, 6).toUpperCase();

      const employeeCode = `EMP-${tenantPrefix}-${String(count + 1).padStart(
        4,
        '0',
      )}`;

      return await this.prisma.employee.create({
        data: {
          employeeCode,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || null,
          department: data.department.trim(),
          position: data.position.trim(),
          salary,
          startDate,
          status: data.status || 'ACTIVE',
          tenantId,
        },
      });
    } catch (error: any) {
      console.error('CREATE EMPLOYEE ERROR:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error?.code === 'P2002') {
        const fields = Array.isArray(error?.meta?.target)
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

  async processPayroll(tenantId: string, period: string) {
    if (!period) {
      throw new BadRequestException('Payroll period is required.');
    }

    const employees = await this.prisma.employee.findMany({
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
        const netSalary = grossSalary - tax - deductions;

        return this.prisma.payroll.create({
          data: {
            employeeId: employee.id,
            period,
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

    return {
      period,
      totalEmployees: payrolls.length,
      totalGross: payrolls.reduce(
        (sum, payroll) => sum + Number(payroll.grossSalary),
        0,
      ),
      totalNet: payrolls.reduce(
        (sum, payroll) => sum + Number(payroll.netSalary),
        0,
      ),
      payrolls,
    };
  }

  async getPayrolls(tenantId: string) {
    return this.prisma.payroll.findMany({
      where: { tenantId },
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async applyLeave(tenantId: string, data: any) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (
      !data.employeeId ||
      !data.type ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new BadRequestException('Please provide valid leave details.');
    }

    if (endDate < startDate) {
      throw new BadRequestException(
        'Leave end date cannot be before the start date.',
      );
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!employee) {
      throw new BadRequestException('Employee was not found.');
    }

    return this.prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate,
        endDate,
        reason: data.reason || null,
        status: data.status || 'PENDING',
        tenantId,
      },
    });
  }

  async getLeaves(tenantId: string) {
    return this.prisma.leave.findMany({
      where: { tenantId },
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
        where: { tenantId },
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