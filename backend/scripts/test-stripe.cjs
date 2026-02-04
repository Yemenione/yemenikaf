const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        console.error("❌ STRIPE_SECRET_KEY is missing in .env file");
        process.exit(1);
    }

    console.log("🔍 Testing Stripe connectivity...");
    const stripe = require('stripe')(secretKey);

    try {
        const account = await stripe.accounts.retrieve();
        console.log("✅ Stripe Connection Successful!");
        console.log(`📡 Account ID: ${account.id}`);
        console.log(`🌍 Default Currency: ${account.default_currency}`);
        console.log(`🏢 Business Name: ${account.settings?.dashboard?.display_name || 'N/A'}`);
    } catch (error) {
        console.error("❌ Stripe Connection Failed!");
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

testStripe();
