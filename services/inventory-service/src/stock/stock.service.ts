import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async create(createStockDto: CreateStockDto) {
    const stock = await this.prisma.stock.create({
      data: {
        ...createStockDto,
        initialQuantity: createStockDto.quantity,
        expirationDate: new Date(createStockDto.expirationDate),
      },
    });

    // Crear movimiento de entrada
    await this.prisma.stockMovement.create({
      data: {
        stockId: stock.id,
        productId: stock.productId,
        type: 'ENTRADA',
        quantity: stock.quantity,
        quantityBefore: 0,
        quantityAfter: stock.quantity,
        reason: 'Stock inicial',
      },
    });

    // Verificar alertas
    await this.checkAndCreateAlerts(stock.productId);

    return stock;
  }

  async findAll(page = 1, limit = 10, productId?: number, expiring?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expirationDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
    }

    const [stocks, total] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expirationDate: 'asc' },
      }),
      this.prisma.stock.count({ where }),
    ]);

    return {
      data: stocks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!stock) {
      throw new NotFoundException(`Stock con ID ${id} no encontrado`);
    }

    return stock;
  }

  async findByProduct(productId: number) {
    return this.prisma.stock.findMany({
      where: { productId },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async getTotalByProduct(productId: number) {
    const stocks = await this.prisma.stock.findMany({
      where: { productId },
    });

    const total = stocks.reduce((sum, stock) => sum + stock.quantity, 0);

    return {
      productId,
      totalQuantity: total,
      batches: stocks.length,
      stocks,
    };
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    await this.findOne(id);

    return this.prisma.stock.update({
      where: { id },
      data: {
        ...updateStockDto,
        expirationDate: updateStockDto.expirationDate
          ? new Date(updateStockDto.expirationDate)
          : undefined,
      },
    });
  }

  async adjustStock(id: number, adjustStockDto: AdjustStockDto) {
    const stock = await this.findOne(id);

    const quantityBefore = stock.quantity;
    let quantityAfter: number;

    if (adjustStockDto.type === 'AJUSTE_POSITIVO') {
      quantityAfter = quantityBefore + adjustStockDto.quantity;
    } else {
      if (quantityBefore < adjustStockDto.quantity) {
        throw new BadRequestException('No hay suficiente stock para el ajuste negativo');
      }
      quantityAfter = quantityBefore - adjustStockDto.quantity;
    }

    // Actualizar stock
    const updatedStock = await this.prisma.stock.update({
      where: { id },
      data: { quantity: quantityAfter },
    });

    // Registrar movimiento
    await this.prisma.stockMovement.create({
      data: {
        stockId: id,
        productId: stock.productId,
        type: adjustStockDto.type,
        quantity: adjustStockDto.quantity,
        quantityBefore,
        quantityAfter,
        reason: adjustStockDto.reason,
        userId: adjustStockDto.userId,
        userName: adjustStockDto.userName,
      },
    });

    // Verificar alertas
    await this.checkAndCreateAlerts(stock.productId);

    return updatedStock;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.stock.delete({
      where: { id },
    });
  }

  async getLowStock(threshold = 10) {
    const stocks = await this.prisma.stock.groupBy({
      by: ['productId', 'productName'],
      _sum: {
        quantity: true,
      },
      having: {
        quantity: {
          _sum: {
            lte: threshold,
          },
        },
      },
    });

    return stocks.map(s => ({
      productId: s.productId,
      productName: s.productName,
      totalQuantity: s._sum.quantity || 0,
    }));
  }

  async getExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.stock.findMany({
      where: {
        expirationDate: {
          lte: futureDate,
          gte: new Date(),
        },
        quantity: {
          gt: 0,
        },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async getExpired() {
    return this.prisma.stock.findMany({
      where: {
        expirationDate: {
          lt: new Date(),
        },
        quantity: {
          gt: 0,
        },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  private async checkAndCreateAlerts(productId: number) {
    const stocks = await this.findByProduct(productId);
    
    if (stocks.length === 0) return;

    const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const productName = stocks[0].productName;

    // Alerta de bajo stock
    if (totalQuantity <= 10) {
      await this.prisma.stockAlert.create({
        data: {
          productId,
          productName,
          alertType: 'LOW_STOCK',
          message: `Stock bajo: ${totalQuantity} unidades disponibles`,
          severity: totalQuantity <= 5 ? 'HIGH' : 'MEDIUM',
        },
      });
    }

    // Alertas de vencimiento
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    for (const stock of stocks) {
      if (stock.expirationDate <= new Date() && stock.quantity > 0) {
        await this.prisma.stockAlert.create({
          data: {
            productId,
            productName,
            alertType: 'EXPIRED',
            message: `Lote ${stock.batchNumber} VENCIDO (${stock.quantity} unidades)`,
            severity: 'HIGH',
          },
        });
      } else if (stock.expirationDate <= thirtyDaysFromNow && stock.quantity > 0) {
        await this.prisma.stockAlert.create({
          data: {
            productId,
            productName,
            alertType: 'EXPIRING_SOON',
            message: `Lote ${stock.batchNumber} próximo a vencer el ${stock.expirationDate.toLocaleDateString()}`,
            severity: 'MEDIUM',
          },
        });
      }
    }
  }
}
