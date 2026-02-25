import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'admin@farmacia.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @ApiProperty({ 
    enum: ['ADMIN', 'GERENTE', 'VENDEDOR', 'CAJERO', 'INVENTARIO'], 
    example: 'VENDEDOR' 
  })
  @IsEnum(['ADMIN', 'GERENTE', 'VENDEDOR', 'CAJERO', 'INVENTARIO'])
  role: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'CAJERO' | 'INVENTARIO';
}