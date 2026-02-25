import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';

@ApiTags('Laboratorios')
@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear laboratorio' })
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar laboratorios' })
  findAll() {
    return this.laboratoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener laboratorio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar laboratorio' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLaboratoryDto: UpdateLaboratoryDto,
  ) {
    return this.laboratoriesService.update(id, updateLaboratoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar laboratorio' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.remove(id);
  }
}
