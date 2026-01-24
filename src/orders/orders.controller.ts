import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { RequestUser } from '../auth/types/user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Заказ успешно создан',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        userId: { type: 'number', example: 1 },
        total: { type: 'number', example: 2999.97 },
        status: { type: 'string', example: 'PENDING' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        orderItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              orderId: { type: 'number', example: 1 },
              productId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
              price: { type: 'number', example: 1499.99 },
              product: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Ноутбук' },
                  category: { type: 'string', example: 'Электроника' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Недостаточно товара на складе или невалидные данные',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Один или несколько товаров не найдены',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неавторизован - требуется JWT токен',
  })
  @Post()
  create(
    @Request() req: { user: RequestUser },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @ApiOperation({
    summary: 'Получить список заказов пользователя с пагинацией',
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
    description: 'Количество заказов на странице (по умолчанию: 10)',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список заказов пользователя',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              userId: { type: 'number', example: 1 },
              total: { type: 'number', example: 2999.97 },
              status: { type: 'string', example: 'PENDING' },
              createdAt: { type: 'string', format: 'date-time' },
              orderItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    productId: { type: 'number', example: 1 },
                    quantity: { type: 'number', example: 2 },
                    price: { type: 'number', example: 1499.99 },
                    product: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Ноутбук' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 15 },
            totalPages: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неавторизован - требуется JWT токен',
  })
  @Get()
  findAll(
    @Request() req: { user: RequestUser },
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findAll(req.user.id, query);
  }

  @ApiOperation({ summary: 'Получить детали заказа по ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID заказа',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Детали заказа',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        userId: { type: 'number', example: 1 },
        total: { type: 'number', example: 2999.97 },
        status: { type: 'string', example: 'PENDING' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        orderItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              orderId: { type: 'number', example: 1 },
              productId: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
              price: { type: 'number', example: 1499.99 },
              product: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Ноутбук' },
                  category: { type: 'string', example: 'Электроника' },
                  price: { type: 'number', example: 1499.99 },
                  stock: { type: 'number', example: 8 },
                  description: { type: 'string', example: 'Игровой ноутбук' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Заказ не найден',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нельзя просматривать чужие заказы',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неавторизован - требуется JWT токен',
  })
  @Get(':id')
  findOne(
    @Request() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(req.user.id, id);
  }
}
