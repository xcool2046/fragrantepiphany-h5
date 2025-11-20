import { Controller, Get, Post, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
// Feature flags default to off; enable via env when customer付费后再开放
const ORDERS_ENABLED = process.env.FEATURE_ADMIN_ORDERS === 'true';
const PRICING_ENABLED = process.env.FEATURE_ADMIN_PRICING === 'true';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  @Get('orders')
  async getOrders() {
    if (!ORDERS_ENABLED) {
      throw new NotFoundException('Orders management is disabled');
    }
    return this.orderRepo.find({
      order: { created_at: 'DESC' },
      take: 100, // Limit to last 100 for now
    });
  }

  @Get('config')
  getConfig() {
    if (!PRICING_ENABLED) {
      throw new NotFoundException('Pricing management is disabled');
    }
    return { price_cny: 1500, price_usd: 500 };
  }

  @Post('config')
  saveConfig(@Body() body: any) {
    if (!PRICING_ENABLED) {
      throw new NotFoundException('Pricing management is disabled');
    }
    return {
      price_cny: Number(body.price_cny),
      price_usd: Number(body.price_usd),
    };
  }
}
