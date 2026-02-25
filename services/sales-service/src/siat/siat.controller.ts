import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SiatService } from './siat.service';

@ApiTags('Facturación Electrónica SIAT')
@Controller('siat')
export class SiatController {
  constructor(private readonly siatService: SiatService) {}

  @Post('invoice/sale/:saleId')
  @ApiOperation({ summary: 'Generar factura electrónica para una venta' })
  async generateInvoice(@Param('saleId', ParseIntPipe) saleId: number) {
    return this.siatService.generateInvoice(saleId);
  }

  @Get('invoice/sale/:saleId')
  @ApiOperation({ summary: 'Obtener factura de una venta' })
  async getInvoiceBySale(@Param('saleId', ParseIntPipe) saleId: number) {
    return this.siatService.getInvoiceBySale(saleId);
  }
}
