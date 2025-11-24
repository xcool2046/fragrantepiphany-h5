import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common'
import { PayService } from './pay.service'
import type { Request, Response } from 'express'
import Stripe from 'stripe'

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
}
