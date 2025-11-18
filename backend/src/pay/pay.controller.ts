import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { PayService } from './pay.service';
import { Request, Response } from 'express';
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
    return this.payService.createSession(body);
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !sig) {
      return res.status(400).send('Missing signature');
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-06-20' as Stripe.LatestApiVersion,
    });
    let event: Stripe.Event;
    try {
      // rawBody is attached by express json verify hook

      const rawBodyContainer = req as Request & { rawBody?: Buffer };
      const rawBodyCandidate: unknown = rawBodyContainer.rawBody;
      if (!rawBodyCandidate || !Buffer.isBuffer(rawBodyCandidate)) {
        return res.status(400).send('Invalid raw body');
      }
      event = stripe.webhooks.constructEvent(rawBodyCandidate, sig, secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      return res.status(400).send(`Webhook Error: ${message}`);
    }
    await this.payService.handleWebhook(event);
    return res.json({ received: true });
  }

  @Get('order/:id')
  getOrder(@Param('id') id: string) {
    return this.payService.getOrder(id);
  }
}
