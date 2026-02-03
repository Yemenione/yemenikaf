const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.products.findMany({
        select: { id: true, name: true, stock_quantity: true }
    });
    console.log("Current Stock Levels:");
    products.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Stock: ${p.stock_quantity}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
