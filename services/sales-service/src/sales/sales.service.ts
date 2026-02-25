import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HttpService } from '../common/services/http.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    // Generar número de venta
    const saleNumber = await this.generateSaleNumber();

    // Validar stock y obtener detalles de productos
    const itemsWithDetails = await Promise.all(
      createSaleDto.items.map(async (item) => {
        const product = await this.httpService.getProduct(item.productId);
        const stock = await this.httpService.getStockByProduct(item.productId);

        if (stock.totalQuantity < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Disponible: ${stock.totalQuantity}`,
          );
        }

        const unitPrice = parseFloat(product.priceSale);
        const discount = item.discount || 0;
        const subtotal = unitPrice * item.quantity;
        const total = subtotal - discount;

        return {
          productId: item.productId,
          productSku: product.sku,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          discount,
          total,
          stockId: stock.stocks[0]?.id, // Usar el primer lote disponible
          batchNumber: stock.stocks[0]?.batchNumber,
        };
      }),
    );

    // Calcular totales
    const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = itemsWithDetails.reduce((sum, item) => sum + item.discount, 0) + (createSaleDto.discount || 0);
    const tax = 0; // Puedes agregar lógica de impuestos aquí
    const total = subtotal - totalDiscount + tax;

    // Crear venta
    const sale = await this.prisma.sale.create({
      data: {
        saleNumber,
        customerId: createSaleDto.customerId,
        customerName: createSaleDto.customerName || 'Cliente General',
        customerNit: createSaleDto.customerNit || '0',
        subtotal,
        discount: totalDiscount,
        tax,
        total,
        paymentMethod: createSaleDto.paymentMethod,
        userId: createSaleDto.userId,
        userName: createSaleDto.userName,
        notes: createSaleDto.notes,
        items: {
          create: itemsWithDetails,
        },
      },
      include: {
        items: true,
      },
    });

    // Descontar stock
    for (const item of itemsWithDetails) {
      if (item.stockId) {
        try {
          await this.httpService.adjustStock(
            item.stockId,
            item.quantity,
            `Venta #${saleNumber}`,
            createSaleDto.userId,
            createSaleDto.userName,
          );
        } catch (error) {
          console.error(`Error al ajustar stock: ${error.message}`);
        }
      }
    }

    return sale;
  }

  async findAll(page = 1, limit = 10, startDate?: string, endDate?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          customer: true,
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        invoice: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return sale;
  }

  async findBySaleNumber(saleNumber: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { saleNumber },
      include: {
        items: true,
        customer: true,
        invoice: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Venta #${saleNumber} no encontrada`);
    }

    return sale;
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const sales = await this.prisma.sale.findMany({ where });

    const stats = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.total.toString()), 0),
      averageSale: 0,
      byPaymentMethod: {} as Record<string, number>,
    };

    stats.averageSale = stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0;

    sales.forEach(sale => {
      const method = sale.paymentMethod;
      stats.byPaymentMethod[method] = (stats.byPaymentMethod[method] || 0) + parseFloat(sale.total.toString());
    });

    return stats;
  }

  async cancel(id: number, reason: string) {
    const sale = await this.findOne(id);

    if (sale.status === 'CANCELLED') {
      throw new BadRequestException('La venta ya está cancelada');
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: `${sale.notes || ''}\nCANCELADA: ${reason}`,
      },
    });
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `${year}${month}${day}`;

    const lastSale = await this.prisma.sale.findFirst({
      where: {
        saleNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        saleNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
