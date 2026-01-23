import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderItemData } from './types/order.types';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;

    // 1. Проверяем, что все товары существуют и есть в наличии
    const productIds = items.map((item) => item.productId);
    const products = await this.db.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found or inactive');
    }

    // 2. Проверяем наличие (stock) и валидируем quantity > 0
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Quantity for product ${product.id} must be greater than 0`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        );
      }
    }

    // 3. Транзакция: создаём заказ, order_items, уменьшаем stock
    return this.db.$transaction(async (tx) => {
      // Вычисляем общую сумму
      let total = 0;
      const orderItemsData: OrderItemData[] = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        const itemTotal = product.price.toNumber() * item.quantity;
        total += itemTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price.toNumber(),
        });

        // Уменьшаем остаток
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });
      }

      // Создаём заказ
      const order = await tx.order.create({
        data: {
          userId,
          total,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });
  }

  async findAll(userId: number, query: OrderQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.db.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: number, id: number) {
    const order = await this.db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }
}
