import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, productId?: number, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          stock: true,
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByProduct(productId: number) {
    return this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const movements = await this.prisma.stockMovement.findMany({ where });

    const stats = {
      totalEntries: 0,
      totalExits: 0,
      totalAdjustments: 0,
      byType: {} as Record<string, number>,
    };

    movements.forEach(movement => {
      if (movement.type === 'ENTRADA') {
        stats.totalEntries += movement.quantity;
      } else if (movement.type === 'SALIDA') {
        stats.totalExits += movement.quantity;
      } else {
        stats.totalAdjustments += movement.quantity;
      }

      stats.byType[movement.type] = (stats.byType[movement.type] || 0) + movement.quantity;
    });

    return stats;
  }
}
