import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { PayService } from './pay.service';
import type { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('api/pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @Post('create-session')
  async createSession(
    @Body()
    body: {
      currency: 'cny' | 'usd';
      metadata?: Record<string, unknown>;
    },
  ) {
    try {
      return await this.payService.createSession(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('Stripe is not configured')) {
        return {
          error: 'Payment is temporarily unavailable (missing Stripe config)',
        };
      }
      throw err;
    }
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      return res.status(400).send('Missing signature');
    }
    let event: Stripe.Event;
    try {
      // rawBody is attached by express json verify hook
      const rawBodyContainer = req as Request & { rawBody?: Buffer };
      const rawBodyCandidate: unknown = rawBodyContainer.rawBody;
      if (!rawBodyCandidate || !Buffer.isBuffer(rawBodyCandidate)) {
        return res.status(400).send('Invalid raw body');
      }
      event = this.payService.constructEventFromWebhook(rawBodyCandidate, sig);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      return res.status(400).send(`Webhook Error: ${message}`);
    }
    const result = await this.payService.handleWebhook(event);
    return res.json(result ?? { received: true });
  }

  @Get('order/:id')
  getOrder(@Param('id') id: string) {
    return this.payService.getOrder(id);
  }

  @Get('config')
  async getConfig() {
    try {
      // Default to USD as per requirements
      const priceId = await this.payService.resolvePriceIdByCurrency('usd');
      const stripe = this.payService.getStripe();

      if (!stripe) {
        // Stripe not configured but mapping exists
        const fallbackAmount = 500;
        return {
          priceDisplay: '$5.00',
          currency: 'usd',
          priceAmount: fallbackAmount,
          priceId,
          source: 'env-mapping',
        };
      }

      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount ?? 500;
      const currency = price.currency;

      // Format price display (e.g., $5.00)
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      });

      return {
        priceDisplay: formatter.format(amount / 100),
        currency,
        priceAmount: amount,
        priceId,
        source: 'stripe',
      };
    } catch (err) {
      console.error('Failed to fetch price config', err);
      // Fallback safe default if Stripe fails
      return {
        priceDisplay: '$5.00',
        currency: 'usd',
        priceAmount: 500,
        source: 'fallback',
      };
    }
  }
}
