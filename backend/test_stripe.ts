
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('No STRIPE_SECRET_KEY');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2024-06-20' } as any);

async function testStripe() {
  try {
    console.log('Testing with automatic_payment_methods...');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test' },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      automatic_payment_methods: { enabled: true },
      success_url: 'http://localhost/success',
      cancel_url: 'http://localhost/cancel',
    } as any);
    console.log('Success with automatic_payment_methods:', session.id);
  } catch (e: any) {
    console.error('Failed with automatic_payment_methods:', e.message);
  }

  try {
    console.log('\nTesting with payment_method_types: ["card"]...');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test' },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      payment_method_types: ['card'],
      success_url: 'http://localhost/success',
      cancel_url: 'http://localhost/cancel',
    });
    console.log('Success with payment_method_types:', session.id);
  } catch (e: any) {
    console.error('Failed with payment_method_types:', e.message);
  }
}

testStripe();
