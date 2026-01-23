import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal, IsInt, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Smartphone', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '999.99' })
  @IsDecimal({ decimal_digits: '2' })
  price: string;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'electronics', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}
