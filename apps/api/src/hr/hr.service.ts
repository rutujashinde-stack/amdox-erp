import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(tenantId: string, data: any) {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const employeeCode = `EMP-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.employee.create({
      data: {
        ...data,
        employeeCode,
        salary: data.salary,
        startDate: new Date(data.startDate),
        tenantId,
      },
    });
  }

  async getEmployees(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processPayroll(tenantId: string, period: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });

    const payrolls = await Promise.all(
      employees.map(emp => {
        const grossSalary = Number(emp.salary);
        const tax = grossSalary * 0.2;
        const deductions = grossSalary * 0.05;
        const netSalary = grossSalary - tax - deductions;
        return this.prisma.payroll.create({
          data: {
            employeeId: emp.id,
            period,
            grossSalary,
            tax,
            deductions,
            netSalary,
            status: 'PROCESSED',
            tenantId,
          },
        });
      })
    );

    return {
      period,
      totalEmployees: payrolls.length,
      totalGross: payrolls.reduce((s, p) => s + Number(p.grossSalary), 0),
      totalNet: payrolls.reduce((s, p) => s + Number(p.netSalary), 0),
      payrolls,
    };
  }

  async getPayrolls(tenantId: string) {
    return this.prisma.payroll.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyLeave(tenantId: string, data: any) {
    return this.prisma.leave.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        tenantId,
      },
    });
  }

  async getLeaves(tenantId: string) {
    return this.prisma.leave.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboard(tenantId: string) {
    const [total, active, onLeave, payrolls] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId } }),
      this.prisma.employee.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.leave.count({ where: { tenantId, status: 'APPROVED' } }),
      this.prisma.payroll.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 1 }),
    ]);

    return {
      totalEmployees: total,
      activeEmployees: active,
      onLeave,
      lastPayrollPeriod: payrolls[0]?.period || 'No payroll yet',
    };
  }
}