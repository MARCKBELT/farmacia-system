import { Module } from '@nestjs/common';
import { SiatService } from './siat.service';
import { SiatController } from './siat.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SiatController],
  providers: [SiatService, PrismaService],
  exports: [SiatService],
})
export class SiatModule {}
