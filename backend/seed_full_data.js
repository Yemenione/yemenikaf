const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding data from correct schema...");

    // 1. Create Admin (in 'admins' table as preferred)
    const adminEmail = 'admin@yemeni.market';
    const existingAdmin = await prisma.admins.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.admins.create({
            data: {
                email: adminEmail,
                password_hash: hashedPassword,
                name: 'System Administrator',
                role: 'SUPER_ADMIN',
                updated_at: new Date()
            }
        });
        console.log("Admin user created: admin@yemeni.market / admin123");
    } else {
        console.log("Admin user already exists");
    }

    // 2. Create Categories (Using 'Category' model name, field 'name', 'slug')
    const categories = ['Honey', 'Coffee', 'Spices', 'Gifts'];
    for (const cat of categories) {
        const slug = cat.toLowerCase();
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (!existing) {
            await prisma.category.create({
                data: { name: cat, slug: slug }
            });
        }
    }

    // 3. Create Sample Products (products table: category_id, stock_quantity, is_active fields)
    const honeyCat = await prisma.category.findUnique({ where: { slug: 'honey' } });
    const coffeeCat = await prisma.category.findUnique({ where: { slug: 'coffee' } });

    if (honeyCat) {
        const existingP = await prisma.products.findUnique({ where: { slug: 'royal-sidr-honey' } });
        if (!existingP) {
            await prisma.products.create({
                data: {
                    name: 'Royal Sidr Honey (Do\'an)',
                    description: 'The rarest and most potent honey in the world, harvested from the remote Do\'an valley.',
                    price: 150.00,
                    stock_quantity: 50,
                    slug: 'royal-sidr-honey',
                    categories: { connect: { id: honeyCat.id } },
                    is_active: true,
                    images: JSON.stringify(['https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'])
                }
            });
        }
    }

    if (coffeeCat) {
        const existingC = await prisma.products.findUnique({ where: { slug: 'premium-haraz-coffee' } });
        if (!existingC) {
            await prisma.products.create({
                data: {
                    name: 'Premium Haraz Coffee',
                    description: 'Sun-dried coffee cherries from the high altitude mountains of Haraz.',
                    price: 45.00,
                    stock_quantity: 100,
                    slug: 'premium-haraz-coffee',
                    categories: { connect: { id: coffeeCat.id } },
                    is_active: true,
                    images: JSON.stringify(['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'])
                }
            });
        }
    }

    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
