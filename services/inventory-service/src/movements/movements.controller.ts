import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MovementsService } from './movements.service';

@ApiTags('Movimientos de Stock')
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar movimientos de stock' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('productId') productId?: number,
    @Query('type') type?: string,
  ) {
    return this.movementsService.findAll(page, limit, productId, type);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de movimientos' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.movementsService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener movimientos por producto' })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.movementsService.findByProduct(productId);
  }
}
