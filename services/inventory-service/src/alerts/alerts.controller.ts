import { Controller, Get, Patch, Delete, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('Alertas de Stock')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'alertType', required: false, type: String })
  findAll(
    @Query('isRead') isRead?: boolean,
    @Query('alertType') alertType?: string,
  ) {
    return this.alertsService.findAll(isRead, alertType);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar alerta como leída' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las alertas como leídas' })
  markAllAsRead() {
    return this.alertsService.markAllAsRead();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar alerta' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.delete(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar todas las alertas' })
  deleteAll() {
    return this.alertsService.deleteAll();
  }
}
