import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ example: 'iPhone 15 Pro', required: false })
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  description?: string;

  @ApiProperty({ example: '1099.99', required: false })
  price?: string;

  @ApiProperty({ example: 30, required: false })
  stock?: number;

  @ApiProperty({ example: 'electronics', required: false })
  category?: string;
}
