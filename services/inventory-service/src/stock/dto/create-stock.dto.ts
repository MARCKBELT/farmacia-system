import { IsInt, IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 'PARAC-500-001' })
  @IsString()
  @IsNotEmpty()
  productSku: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'LOTE-2024-001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  @IsNotEmpty()
  expirationDate: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 5.50 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  costPrice: number;

  @ApiPropertyOptional({ example: 'A-1-B' })
  @IsString()
  @IsOptional()
  warehouseLocation?: string;
}
