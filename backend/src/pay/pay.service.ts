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

  public async resolvePriceIdByCurrency(currency: string): Promise<string> {
    const key = currency.toLowerCase();

    if (this.envPriceMap?.[key]) return this.envPriceMap[key];

    const cached = this.priceCache.get(key);
    if (cached) return cached;

    try {
      const prices = await this.stripe.prices.list({
        active: true,
        currency: key,
        limit: 100,
      });

      const price = prices.data.find((p) => p.type === 'one_time') ?? prices.data[0];
      if (price) {
        this.priceCache.set(key, price.id);
        return price.id;
      }

      console.warn(`No active Stripe price found for currency: ${currency}. Attempting to auto-create one.`);
      
      // Auto-create product and price
      const product = await this.stripe.products.create({
        name: 'Tarot Reading Unlock',
        metadata: { type: 'tarot_unlock' }
      });

      const newPrice = await this.stripe.prices.create({
        product: product.id,
        currency: key,
        unit_amount: 500, // 5.00
      });
      
      console.log(`Auto-created price ${newPrice.id} for currency ${currency}`);
      this.priceCache.set(key, newPrice.id);
      return newPrice.id;

    } catch (err) {
      console.error(`Error resolving/creating price for ${currency}:`, err);
      throw err;
    }
  }

  async createSession(input: {
    currency: string;
    metadata?: Record<string, unknown>;
  }) {
    let publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
    if (!publicBaseUrl) {
      console.error('Missing PUBLIC_BASE_URL env var');
      throw new Error('PUBLIC_BASE_URL is required for Stripe redirect');
    }
    // Remove trailing slash if present
    if (publicBaseUrl.endsWith('/')) {
      publicBaseUrl = publicBaseUrl.slice(0, -1);
    }
    console.log(`Creating Stripe session with callback URL base: ${publicBaseUrl}`);

    const priceId = await this.resolvePriceIdByCurrency(input.currency);

    let session: Stripe.Checkout.Session;
    
    // Prepare metadata for Stripe: Flatten/Serialize nested objects
    const stripeMetadata: Record<string, string> = {};
    if (input.metadata) {
      for (const [k, v] of Object.entries(input.metadata)) {
        if (typeof v === 'object' && v !== null) {
          stripeMetadata[k] = JSON.stringify(v);
        } else {
          stripeMetadata[k] = String(v);
        }
      }
    }

    try {
      // 1. Create Order first to get the ID
      const order = this.orders.create({
        amount: 0, // Will update after session creation
        currency: input.currency,
        status: 'pending',
        metadata: input.metadata,
      });
      await this.orders.save(order);

      // 2. Prepare URLs with Order ID
      const successUrl = `${publicBaseUrl}/pay/callback?status=success&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${publicBaseUrl}/pay/callback?status=cancel&order_id=${order.id}`;

      // 3. Create Stripe Session
      stripeMetadata.order_id = order.id;
      
      session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: order.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: stripeMetadata,
      } as Stripe.Checkout.SessionCreateParams);

      console.log(`Stripe session created: ${session.id}, URL: ${session.url}`);

      // 4. Update Order with Session details
      const amount = session.amount_total ?? session.amount_subtotal ?? 0;
      const currency = session.currency ?? input.currency;
      
      await this.orders.update(
        { id: order.id }, 
        {
          amount,
          currency,
          stripe_session_id: session.id,
        }
      );

      return { orderId: order.id, sessionUrl: session.url };

    } catch (error) {
      console.error('Stripe Session Creation Failed:', error);
      throw error;
    }
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

  async checkAndUpdateStatus(orderId: string): Promise<Order | null> {
    const order = await this.getOrder(orderId);
    if (!order) return null;
    if (order.status === 'succeeded') return order;
    if (!order.stripe_session_id) return order;

    try {
        const session = await this.stripe.checkout.sessions.retrieve(order.stripe_session_id);
        if (session.payment_status === 'paid') {
            await this.orders.update(
                { id: orderId },
                {
                    status: 'succeeded',
                    payment_intent_id: session.payment_intent as string,
                }
            );
            // Refetch updated order
            return this.getOrder(orderId);
        }
    } catch (err) {
        console.error(`Failed to check stripe status for order ${orderId}:`, err);
    }
    return order;
  }
}
