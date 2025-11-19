import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

function getConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  }
  return { price_cny: 1500, price_usd: 500 };
}

@Injectable()
export class PayService {
  private stripe: Stripe;

  constructor(@InjectRepository(Order) private orders: Repository<Order>) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15' as any,
    });
  }

  async createSession(input: {
    currency: 'cny' | 'usd';
    metadata?: Record<string, unknown>;
  }) {
    const config = getConfig();
    const isCny = input.currency === 'cny';
    const amount = isCny ? config.price_cny : config.price_usd;
    // Price ID logic might need adjustment if we want dynamic pricing without creating new Price objects in Stripe.
    // For simplicity, we'll use ad-hoc price_data which supports custom amounts.
    // The original code used price_id if available. We should prioritize dynamic amount if we want admin control.
    // But Stripe Price ID is better for reporting.
    // Requirement says "RMB / USD 单档价格可在后台调整".
    // If we use price_data (inline pricing), we can change amount freely.
    const priceId = isCny
      ? process.env.STRIPE_PRICE_ID_CNY
      : process.env.STRIPE_PRICE_ID_USD;
    const order = this.orders.create({
      amount,
      currency: input.currency,
      status: 'pending',
      // price_id: priceId || undefined, // We drop price_id to support dynamic pricing
      metadata: input.metadata,
    });
    await this.orders.save(order);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: input.currency,
            product_data: { name: 'Tarot Reading' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.PUBLIC_BASE_URL || ''}/pay/callback?status=success&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_BASE_URL || ''}/pay/callback?status=cancel&order_id=${order.id}`,
      metadata: { order_id: order.id, ...(input.metadata || {}) },
    });
    order.stripe_session_id = session.id;
    await this.orders.save(order);
    return { orderId: order.id, sessionUrl: session.url };
  }

  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = (session.metadata || {}) as Record<string, string>;
      const orderId = metadata.order_id;
      if (orderId) {
        await this.orders.update(
          { id: orderId },
          {
            status: 'succeeded',
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent as string,
          },
        );
      }
    }
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const metadata = (pi.metadata || {}) as Record<string, string>;
      const orderId = metadata.order_id;
      if (orderId) {
        await this.orders.update(
          { id: orderId },
          { status: 'failed', payment_intent_id: pi.id },
        );
      }
    }
  }

  async getOrder(id: string) {
    return this.orders.findOne({ where: { id } });
  }
}
