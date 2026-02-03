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

    const configs = [
        { key: 'site_name', value: 'Yemeni Treasures', group: 'general', type: 'text', isPublic: true, description: 'The public name of the store' },
        { key: 'site_logo', value: 'https://placehold.co/200x60/transparent/D4AF37?text=Yemeni+Market', group: 'general', type: 'image', isPublic: true, description: 'URL of the site logo image' },
        { key: 'site_currency', value: 'USD', group: 'general', type: 'text', isPublic: true, description: 'Default currency symbol/code' },
        { key: 'stripe_secret_key', value: 'sk_test_PLACEHOLDER', group: 'payment', type: 'text', isPublic: false, description: 'Secret key for Stripe backend operations' },
        { key: 'stripe_public_key', value: 'pk_test_51Sv49G2Q5lB4HkA9tiDFwwOuhxHzmArrgEfGDgo2R5HyvdHktjrJaiwWJSENR36DRKain0CdFxUvVR0yaNCzQdsn00cwsw2rCJ', group: 'payment', type: 'text', isPublic: true, description: 'Public key for Stripe frontend elements' },
        { key: 'smtp_host', value: 'smtp.gmail.com', group: 'email', type: 'text', isPublic: false, description: 'SMTP server host address' },
        { key: 'smtp_port', value: '587', group: 'email', type: 'text', isPublic: false, description: 'SMTP server port' },
        { key: 'smtp_user', value: 'user@example.com', group: 'email', type: 'text', isPublic: false, description: 'SMTP username for authentication' },
        { key: 'smtp_pass', value: 'password', group: 'email', type: 'text', isPublic: false, description: 'SMTP password for authentication' },
        { key: 'smtp_from_email', value: 'no-reply@yemeni.market', group: 'email', type: 'text', isPublic: false, description: 'Sender email address for outgoing mails' },
        { key: 'smtp_from_name', value: 'Yemeni Market', group: 'email', type: 'text', isPublic: true, description: 'Sender name for outgoing mails' },
        { key: 'store_email', value: 'admin@yemeni.market', group: 'general', type: 'text', isPublic: true, description: 'Primary contact email for the store' }
    ];

    for (const conf of configs) {
        const existing = await prisma.store_config.findUnique({ where: { key: conf.key } });
        if (!existing) {
            await prisma.store_config.create({ data: conf });
        } else {
            // Optional: Update if exists to ensure values are correct
            await prisma.store_config.update({ where: { key: conf.key }, data: conf });
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
