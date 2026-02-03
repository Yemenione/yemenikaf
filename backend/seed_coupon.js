const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const coupon = await prisma.coupons.create({
            data: {
                code: 'WELCOME10',
                discount_type: 'percentage',
                value: 10.00, // 10%
                expiration_date: new Date('2030-12-31'),
                usage_limit: 1000,
                is_active: true
            }
        });
        console.log('Coupon created:', coupon);
    } catch (e) {
        if (e.code === 'P2002') {
            console.log("Coupon WELCOME10 already exists.");
        } else {
            console.error(e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
