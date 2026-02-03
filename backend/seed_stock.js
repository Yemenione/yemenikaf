const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding stock quantities...');
    const count = await prisma.products.updateMany({
        data: {
            stock_quantity: 100,
            is_active: true
        }
    });
    console.log(`Updated ${count.count} products with 100 stock.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
