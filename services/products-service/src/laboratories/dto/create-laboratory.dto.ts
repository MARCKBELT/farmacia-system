import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLaboratoryDto {
  @ApiProperty({ example: 'Bayer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: { 
      phone: '+591 2 1234567', 
      email: 'contacto@bayer.com.bo',
      address: 'Av. Arce 123, La Paz'
    } 
  })
  @IsObject()
  @IsOptional()
  contactInfo?: any;
}
