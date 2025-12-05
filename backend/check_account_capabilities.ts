
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend directory manually since this script is at root level relative to where I might run it, 
// or I'll just hardcode load from current dir if I assume I run it from backend.
// Actually, let's just use the one in backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error('No STRIPE_SECRET_KEY found');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2024-06-20' } as any);

async function checkAccount() {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('Account Capabilities:', JSON.stringify(account.capabilities, null, 2));
    // Also check for specific alipay capability if not in the main object
    console.log('Full Account Object Keys:', Object.keys(account));
    
    // Check if 'alipay' is mentioned anywhere
    const caps = account.capabilities as any;
    if (caps?.alipay_payments === 'active') {
        console.log('✅ Alipay is ACTIVE in capabilities.');
    } else {
        console.log('❌ Alipay is NOT active in capabilities.');
    }

  } catch (error) {
    console.error('Error fetching account:', error);
  }
}

checkAccount();
