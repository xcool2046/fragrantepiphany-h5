
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

function checkProductionReadiness() {
  console.log('🔍 Checking Payment Configuration for Production...\n');

  let errors: string[] = [];
  let warnings: string[] = [];

  // 1. Check Stripe Secret Key
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    errors.push('❌ STRIPE_SECRET_KEY is missing.');
  } else if (secretKey.startsWith('sk_test_')) {
    warnings.push('⚠️  Current STRIPE_SECRET_KEY is a TEST key (sk_test_...). For Production, use a LIVE key (sk_live_...).');
  } else if (secretKey.startsWith('sk_live_')) {
    console.log('✅ STRIPE_SECRET_KEY looks like a LIVE key.');
  } else {
    warnings.push('❓ STRIPE_SECRET_KEY format unknown.');
  }

  // 2. Check Public Base URL
  const baseUrl = process.env.PUBLIC_BASE_URL || '';
  if (!baseUrl) {
    errors.push('❌ PUBLIC_BASE_URL is missing.');
  } else if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    warnings.push(`⚠️  PUBLIC_BASE_URL is set to "${baseUrl}". For Production, this must be your actual domain (e.g. https://your-domain.com).`);
  } else {
    console.log(`✅ PUBLIC_BASE_URL is set to "${baseUrl}".`);
  }

  // 3. Check Webhook Secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!webhookSecret) {
    warnings.push('⚠️  STRIPE_WEBHOOK_SECRET is missing. Webhooks (payment confirmation) will verify signatures, but correct secret is needed.');
  } else if (webhookSecret.startsWith('whsec_')) {
    console.log('✅ STRIPE_WEBHOOK_SECRET is set.');
  }

  // 4. Check Price IDs
  const priceIdsJson = process.env.STRIPE_PRICE_IDS_JSON || '';
  try {
    const prices = JSON.parse(priceIdsJson);
    console.log('✅ STRIPE_PRICE_IDS_JSON is valid JSON.');
    
    // Check if live IDs are placeholders? 
    // Usually hard to tell, but we can check if they look like "price_..."
    const keys = Object.keys(prices);
    if (keys.length === 0) warnings.push('⚠️  STRIPE_PRICE_IDS_JSON is empty.');
    
    // Simple check on values
    let allLookLikeIds = true;
    for(const k of keys) {
      if (!String(prices[k]).startsWith('price_')) {
        // Could be product ids, but usually price_ for checkout
        // Just a hint
      }
    }
    console.log(`ℹ️  Found ${keys.length} price IDs configured.`);

  } catch (e) {
    errors.push('❌ STRIPE_PRICE_IDS_JSON is NOT valid JSON.');
  }

  console.log('\n--- REPORT ---');
  if (errors.length > 0) {
    console.log('🔴 ERRORS (Must Fix):');
    errors.forEach(e => console.log(e));
  }
  if (warnings.length > 0) {
    console.log('🟡 WARNINGS (Review for Prod):');
    warnings.forEach(w => console.log(w));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('🟢 Configuration looks READY for Production!');
  } else {
    console.log('\nPlease update your .env file with production values.');
  }
}

checkProductionReadiness();
