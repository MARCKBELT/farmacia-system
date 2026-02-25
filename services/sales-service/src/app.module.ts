import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { SiatModule } from './siat/siat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomersModule,
    SalesModule,
    SiatModule,
  ],
})
export class AppModule {}
