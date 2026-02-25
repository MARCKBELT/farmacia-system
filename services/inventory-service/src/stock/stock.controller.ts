import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @ApiOperation({ summary: 'Crear entrada de stock' })
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar stock con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'expiring', required: false, type: Boolean })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('productId') productId?: number,
    @Query('expiring') expiring?: boolean,
  ) {
    return this.stockService.findAll(page, limit, productId, expiring);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Obtener productos con bajo stock' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowStock(@Query('threshold') threshold?: number) {
    return this.stockService.getLowStock(threshold);
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Obtener productos próximos a vencer' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getExpiringSoon(@Query('days') days?: number) {
    return this.stockService.getExpiringSoon(days);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Obtener productos vencidos' })
  getExpired() {
    return this.stockService.getExpired();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener stock por producto' })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockService.findByProduct(productId);
  }

  @Get('product/:productId/total')
  @ApiOperation({ summary: 'Obtener total de stock por producto' })
  getTotalByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockService.getTotalByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener stock por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar stock' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.stockService.update(id, updateStockDto);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Ajustar cantidad de stock' })
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustStockDto: AdjustStockDto,
  ) {
    return this.stockService.adjustStock(id, adjustStockDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar stock' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.remove(id);
  }
}
