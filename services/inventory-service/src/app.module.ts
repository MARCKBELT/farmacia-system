import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StockModule } from './stock/stock.module';
import { MovementsModule } from './movements/movements.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StockModule,
    MovementsModule,
    AlertsModule,
  ],
})
export class AppModule {}
