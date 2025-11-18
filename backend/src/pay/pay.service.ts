import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import Stripe from 'stripe';

@Injectable()
export class PayService {
  private stripe: Stripe;

  constructor(@InjectRepository(Order) private orders: Repository<Order>) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-20' as Stripe.LatestApiVersion,
    });
  }

  async createSession(input: {
    currency: 'cny' | 'usd';
    metadata?: Record<string, unknown>;
  }) {
    const isCny = input.currency === 'cny';
    const amount = isCny ? 1500 : 500;
    const priceId = isCny
      ? process.env.STRIPE_PRICE_ID_CNY
      : process.env.STRIPE_PRICE_ID_USD;
    const order = this.orders.create({
      amount,
      currency: input.currency,
      status: 'pending',
      price_id: priceId || undefined,
      metadata: input.metadata,
    });
    await this.orders.save(order);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
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
