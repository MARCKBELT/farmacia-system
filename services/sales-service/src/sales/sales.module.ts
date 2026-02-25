import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaService } from '../prisma.service';
import { HttpService } from '../common/services/http.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, PrismaService, HttpService],
  exports: [SalesService],
})
export class SalesModule {}
