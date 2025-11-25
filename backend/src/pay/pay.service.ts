import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import Stripe from 'stripe';
const STRIPE_API_VERSION = '2024-06-20' as unknown as Stripe.LatestApiVersion;

@Injectable()
export class PayService {
  private stripe: Stripe;
  private priceCache = new Map<string, string>();
  private envPriceMap: Record<string, string> | null;

  constructor(@InjectRepository(Order) private orders: Repository<Order>) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION });
    this.envPriceMap = this.loadEnvPriceMap();
  }

  getStripe() {
    return this.stripe;
  }

  private loadEnvPriceMap(): Record<string, string> | null {
    const raw =
      process.env.STRIPE_PRICE_IDS_JSON_TEST &&
      process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
        ? process.env.STRIPE_PRICE_IDS_JSON_TEST
        : process.env.STRIPE_PRICE_IDS_JSON;

    if (!raw) return null;

    let mapping: Record<string, string>;
    try {
      mapping = JSON.parse(raw) as Record<string, string>;
    } catch (err) {
      throw new Error('Invalid STRIPE_PRICE_IDS_JSON, must be valid JSON object');
    }
    return mapping;
  }

  private async resolvePriceIdByCurrency(currency: string): Promise<string> {
    const key = currency.toLowerCase();

    if (this.envPriceMap?.[key]) return this.envPriceMap[key];

    const cached = this.priceCache.get(key);
    if (cached) return cached;

    const prices = await this.stripe.prices.list({
      active: true,
      currency: key,
      limit: 100,
    });

    const price = prices.data.find((p) => p.type === 'one_time') ?? prices.data[0];
    if (!price) {
      throw new Error(`No active Stripe price found for currency: ${currency}`);
    }

    this.priceCache.set(key, price.id);
    return price.id;
  }

  async createSession(input: {
    currency: string;
    metadata?: Record<string, unknown>;
  }) {
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
    if (!publicBaseUrl) {
      throw new Error('PUBLIC_BASE_URL is required for Stripe redirect');
    }

    const priceId = await this.resolvePriceIdByCurrency(input.currency);

    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${publicBaseUrl}/pay/callback?status=success&order_id={ORDER_ID}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${publicBaseUrl}/pay/callback?status=cancel&order_id={ORDER_ID}`,
        metadata: { ...(input.metadata || {}) },
      } as Stripe.Checkout.SessionCreateParams);
    } catch (error) {
      console.error('Stripe Session Creation Failed:', error);
      throw error;
    }

    const amount = session.amount_total ?? session.amount_subtotal ?? 0;
    const currency = session.currency ?? input.currency;
    const order = this.orders.create({
      amount,
      currency,
      status: 'pending',
      metadata: input.metadata,
      stripe_session_id: session.id,
    });
    await this.orders.save(order);

    // 把订单 ID 写回 session metadata（需更新后再保存）
    if (!session.metadata) session.metadata = {};
    session.metadata.order_id = order.id;
    try {
      await this.stripe.checkout.sessions.update(session.id, {
        metadata: session.metadata,
      });
    } catch (err) {
      console.error('Failed to update session metadata with order id', err);
      // 不阻断流程，order_id 已存本地
    }

    // 替换回调 URL 里的占位符
    const successUrl =
      session.success_url?.replace('{ORDER_ID}', order.id) ??
      `${publicBaseUrl}/pay/callback?status=success&order_id=${order.id}&session_id=${session.id}`;
    const cancelUrl =
      session.cancel_url?.replace('{ORDER_ID}', order.id) ??
      `${publicBaseUrl}/pay/callback?status=cancel&order_id=${order.id}`;

    try {
      await this.stripe.checkout.sessions.update(session.id, {
        success_url: successUrl,
        cancel_url: cancelUrl,
      } as any);
    } catch (err) {
      console.error('Failed to update session URLs', err);
    }

    return { orderId: order.id, sessionUrl: session.url };
  }

  constructEventFromWebhook(rawBody: Buffer, sig: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }
    return this.stripe.webhooks.constructEvent(rawBody, sig, secret);
  }

  async handleWebhook(event: Stripe.Event) {
    const allowed = new Set<Stripe.Event.Type>([
      'checkout.session.completed',
      'payment_intent.payment_failed',
    ]);
    if (!allowed.has(event.type)) {
      return { ignored: true };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = (session.metadata || {}) as Record<string, string>;
      const orderId = metadata.order_id;
      if (!orderId) return { skipped: 'no order_id' };
      const order = await this.orders.findOne({ where: { id: orderId } });
      if (!order) return { skipped: 'order not found' };
      // 幂等处理：已成功则直接返回
      if (order.status === 'succeeded') return { ok: true, idempotent: true };
      // 校验金额与币种一致
      if (
        session.currency !== order.currency ||
        (session.amount_total ?? session.amount_subtotal ?? 0) !== order.amount
      ) {
        return { skipped: 'amount or currency mismatch' };
      }
      await this.orders.update(
        { id: orderId },
        {
          status: 'succeeded',
          stripe_session_id: session.id,
          payment_intent_id:
            (session.payment_intent as string) ||
            order.payment_intent_id ||
            undefined,
        },
      );
      return { ok: true };
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const metadata = (pi.metadata || {}) as Record<string, string>;
      const orderId = metadata.order_id;
      if (!orderId) return { skipped: 'no order_id' };
      await this.orders.update(
        { id: orderId },
        { status: 'failed', payment_intent_id: pi.id },
      );
      return { ok: true };
    }
  }

  async getOrder(id: string) {
    return this.orders.findOne({ where: { id } });
  }
}
