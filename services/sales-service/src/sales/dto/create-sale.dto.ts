import { IsEnum, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  customerNit?: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ enum: ['EFECTIVO', 'QR', 'TARJETA', 'CREDITO'], example: 'EFECTIVO' })
  @IsEnum(['EFECTIVO', 'QR', 'TARJETA', 'CREDITO'])
  @IsNotEmpty()
  paymentMethod: 'EFECTIVO' | 'QR' | 'TARJETA' | 'CREDITO';

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 'Venta de mostrador' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'admin@farmacia.com' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: 'Administrador' })
  @IsString()
  @IsOptional()
  userName?: string;
}
