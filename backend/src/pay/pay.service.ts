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
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    console.log('Stripe initialized with API version:', (this.stripe as any)._apiVersion);
  }

  async createSession(input: {
    currency: 'cny' | 'usd';
    metadata?: Record<string, unknown>;
  }) {
    const config = getConfig();
    // Always use USD as requested by user ("Backstage should only modify USD")
    // Stripe/Alipay will handle the currency conversion for the user.
    const amount = config.price_usd; 

    const order = this.orders.create({
      amount,
      currency: 'usd', // Force USD
      status: 'pending',
      metadata: input.metadata,
    });
    await this.orders.save(order);

    // Use automatic_payment_methods to let Stripe Dashboard control available methods (Apple Pay, Alipay, etc.)

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Tarot Reading - Past, Now, Future',
              },
              unit_amount: config.price_usd,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.PUBLIC_BASE_URL || ''}/pay/callback?status=success&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.PUBLIC_BASE_URL || ''}/pay/callback?status=cancel&order_id=${order.id}`,
        metadata: { order_id: order.id, ...(input.metadata || {}) },
      } as Stripe.Checkout.SessionCreateParams);
      console.log('Stripe Session Created:', JSON.stringify(session, null, 2)); // Debug log
      order.stripe_session_id = session.id;
      await this.orders.save(order);
      return { orderId: order.id, sessionUrl: session.url };
    } catch (error) {
      console.error('Stripe Session Creation Failed:', error);
      // Fallback to card only if specific methods fail?
      // For now, just rethrow so we can see the error in logs
      throw error;
    }
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
