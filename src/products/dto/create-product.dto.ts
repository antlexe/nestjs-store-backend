import { IsString, IsDecimal, IsInt, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDecimal({ decimal_digits: '2' })
  price: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  category?: string;
}
