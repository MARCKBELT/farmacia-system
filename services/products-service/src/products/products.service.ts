import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Verificar si el SKU ya existe
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new ConflictException('El SKU ya existe');
    }

    // Verificar si el código de barras ya existe (si se proporciona)
    if (createProductDto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: createProductDto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('El código de barras ya existe');
      }
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        laboratory: true,
      },
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
            { barcode: { contains: search, mode: 'insensitive' as const } },
            { activeIngredient: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          laboratory: true,
          stock: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        laboratory: true,
        stock: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        laboratory: true,
        stock: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con código de barras ${barcode} no encontrado`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Verificar que existe

    // Verificar SKU duplicado
    if (updateProductDto.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          NOT: { id },
        },
      });

      if (existingSku) {
        throw new ConflictException('El SKU ya existe');
      }
    }

    // Verificar código de barras duplicado
    if (updateProductDto.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: {
          barcode: updateProductDto.barcode,
          NOT: { id },
        },
      });

      if (existingBarcode) {
        throw new ConflictException('El código de barras ya existe');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        laboratory: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getLowStock(threshold?: number) {
    const minStock = threshold || 10;

    const products = await this.prisma.product.findMany({
      where: {
        stock: {
          some: {
            quantity: {
              lte: minStock,
            },
          },
        },
      },
      include: {
        laboratory: true,
        stock: true,
      },
    });

    return products;
  }
}
