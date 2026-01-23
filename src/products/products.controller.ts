import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('products')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Создание товара (только ADMIN)' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Товар успешно создан',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Ноутбук' },
        category: { type: 'string', example: 'Электроника' },
        price: { type: 'number', example: 999.99 },
        stock: { type: 'number', example: 10 },
        description: { type: 'string', example: 'Игровой ноутбук' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неавторизован - требуется JWT токен',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нет прав - требуется роль ADMIN',
  })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({
    summary: 'Получить список товаров с пагинацией и фильтрацией по категории',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы (по умолчанию: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество товаров на странице (по умолчанию: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Фильтр по категории',
    example: 'Электроника',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список товаров с пагинацией',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Ноутбук' },
              category: { type: 'string', example: 'Электроника' },
              price: { type: 'number', example: 999.99 },
              stock: { type: 'number', example: 10 },
              description: { type: 'string', example: 'Игровой ноутбук' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID товара',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Товар найден',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Ноутбук' },
        category: { type: 'string', example: 'Электроника' },
        price: { type: 'number', example: 999.99 },
        stock: { type: 'number', example: 10 },
        description: { type: 'string', example: 'Игровой ноутбук' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Товар не найден или деактивирован',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновить товар (только ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID товара',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Товар успешно обновлён',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Обновлённый ноутбук' },
        category: { type: 'string', example: 'Электроника' },
        price: { type: 'number', example: 899.99 },
        stock: { type: 'number', example: 15 },
        description: { type: 'string', example: 'Обновлённое описание' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неавторизован - требуется JWT токен',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нет прав - требуется роль ADMIN',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: 'Удалить товар (soft delete, только ADMIN)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID товара',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Товар помечен как удалённый (isActive = false)',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Ноутбук' },
        category: { type: 'string', example: 'Электроника' },
        price: { type: 'number', example: 999.99 },
        stock: { type: 'number', example: 10 },
        description: { type: 'string', example: 'Игровой ноутбук' },
        isActive: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неавторизован - требуется JWT токен',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нет прав - требуется роль ADMIN',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
