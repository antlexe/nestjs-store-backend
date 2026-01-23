import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  async create(createProductDto: CreateProductDto) {
    return this.db.product.create({
      data: {
        ...createProductDto,
        price: parseFloat(createProductDto.price),
      },
    });
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10, category } = query;
    const skip = (page - 1) * limit;

    const where = category ? { category, isActive: true } : { isActive: true };

    const [products, total] = await Promise.all([
      this.db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.db.product.findUnique({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.db.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        price: updateProductDto.price
          ? parseFloat(updateProductDto.price)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.db.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
