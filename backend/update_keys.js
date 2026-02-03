const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateKeys() {
    console.log("Updating Stripe Keys...");

    const keys = [
        { key: 'stripe_public_key', value: 'pk_test_51Sv49G2Q5lB4HkA9tiDFwwOuhxHzmArrgEfGDgo2R5HyvdHktjrJaiwWJSENR36DRKain0CdFxUvVR0yaNCzQdsn00cwsw2rCJ' },
        { key: 'stripe_secret_key', value: 'sk_test_PLACEHOLDER' }
    ];

    for (const k of keys) {
        await prisma.store_config.updateMany({
            where: { key: k.key },
            data: { value: k.value }
        });
        console.log(`Updated ${k.key}`);
    }
    console.log("Done.");
}

updateKeys()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
