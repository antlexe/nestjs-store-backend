import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { RequestUser } from 'src/auth/types/user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Request() req: { user: RequestUser },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  findAll(
    @Request() req: { user: RequestUser },
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findAll(req.user.id, query);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: RequestUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(req.user.id, id);
  }
}
