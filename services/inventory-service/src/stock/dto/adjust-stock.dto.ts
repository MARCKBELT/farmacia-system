import { IsInt, IsNotEmpty, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ enum: ['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'], example: 'AJUSTE_POSITIVO' })
  @IsEnum(['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'])
  @IsNotEmpty()
  type: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';

  @ApiPropertyOptional({ example: 'Corrección de inventario físico' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'admin@farmacia.com' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: 'Administrador' })
  @IsString()
  @IsOptional()
  userName?: string;
}
