import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'PARAC-500-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: '7501234567890' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Analgésico y antipirético' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  laboratoryId?: number;

  @ApiPropertyOptional({ example: 'Analgésicos' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isControlled?: boolean;

  @ApiPropertyOptional({ example: 'Paracetamol' })
  @IsString()
  @IsOptional()
  activeIngredient?: string;

  @ApiPropertyOptional({ example: 'caja' })
  @IsString()
  @IsOptional()
  unitType?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiProperty({ example: 5.50 })
  @IsNumber()
  @Min(0)
  pricePurchase: number;

  @ApiProperty({ example: 12.00 })
  @IsNumber()
  @Min(0)
  priceSale: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
