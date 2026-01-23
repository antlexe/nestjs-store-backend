import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [DatabaseModule, AuthModule, ProductsModule, OrdersModule],
})
export class AppModule {}
