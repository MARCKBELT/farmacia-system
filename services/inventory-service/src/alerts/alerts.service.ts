import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async findAll(isRead?: boolean, alertType?: string) {
    const where: any = {};

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (alertType) {
      where.alertType = alertType;
    }

    return this.prisma.stockAlert.findMany({
      where,
      orderBy: [
        { isRead: 'asc' },
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async markAsRead(id: number) {
    return this.prisma.stockAlert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead() {
    return this.prisma.stockAlert.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: number) {
    return this.prisma.stockAlert.delete({
      where: { id },
    });
  }

  async deleteAll() {
    return this.prisma.stockAlert.deleteMany({});
  }
}
