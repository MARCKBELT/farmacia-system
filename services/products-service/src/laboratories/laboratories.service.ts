import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';

@Injectable()
export class LaboratoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createLaboratoryDto: CreateLaboratoryDto) {
    const existing = await this.prisma.laboratory.findUnique({
      where: { name: createLaboratoryDto.name },
    });

    if (existing) {
      throw new ConflictException('El laboratorio ya existe');
    }

    return this.prisma.laboratory.create({
      data: createLaboratoryDto,
    });
  }

  async findAll() {
    return this.prisma.laboratory.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const laboratory = await this.prisma.laboratory.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!laboratory) {
      throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    }

    return laboratory;
  }

  async update(id: number, updateLaboratoryDto: UpdateLaboratoryDto) {
    await this.findOne(id);

    if (updateLaboratoryDto.name) {
      const existing = await this.prisma.laboratory.findFirst({
        where: {
          name: updateLaboratoryDto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('El nombre del laboratorio ya existe');
      }
    }

    return this.prisma.laboratory.update({
      where: { id },
      data: updateLaboratoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.laboratory.delete({
      where: { id },
    });
  }
}
