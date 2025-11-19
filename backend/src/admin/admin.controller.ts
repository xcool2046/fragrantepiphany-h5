import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  @Get('orders')
  async getOrders() {
    return this.orderRepo.find({
      order: { created_at: 'DESC' },
      take: 100, // Limit to last 100 for now
    });
  }

  @Get('config')
  getConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
    return { price_cny: 1500, price_usd: 500 };
  }

  @Post('config')
  saveConfig(@Body() body: any) {
    const config = {
      price_cny: Number(body.price_cny),
      price_usd: Number(body.price_usd),
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return config;
  }
}
