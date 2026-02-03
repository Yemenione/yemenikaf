require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve Static Frontend Files
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to handle BigInt/Decimal serialization for JSON
// (Prisma returns Decimal objects which standard JSON.stringify might treat oddly, 
// usually it works but good to be safe if BigInt is involved)
const replacer = (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    return value;
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// Load Config from DB (store_config table)
let config = {};
const loadConfig = async () => {
    try {
        const configs = await prisma.store_config.findMany();
        configs.forEach(c => {
            config[c.key] = c.value;
        });
        console.log("Configuration loaded from DB");
    } catch (e) {
        console.error("Failed to load config from DB", e);
    }
};

// Register
app.post('/api/auth/register', async (req, res) => {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    try {
        const existing = await prisma.customers.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.customers.create({
            data: {
                first_name: full_name.split(' ')[0], // Simple split
                last_name: full_name.split(' ').slice(1).join(' '),
                email,
                password_hash: hashedPassword,
                created_at: new Date()
            }
        });

        res.status(201).json({ message: 'User registered', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.customers.findUnique({ where: { email } });
        if (!user || !user.password_hash) return res.status(400).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email }, // Customers don't have 'role' col in provided schema, assume user
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get Products (with Search)
app.get('/api/products', async (req, res) => {
    const { search } = req.query;
    try {
        const whereClause = { is_active: true };

        if (search) {
            whereClause.OR = [
                { name: { contains: search } }, // Case-insensitive by default in some MySQL collations, but implicit here
                { description: { contains: search } },
                { categories: { name: { contains: search } } }
            ];
        }

        const products = await prisma.products.findMany({
            where: whereClause,
            include: {
                categories: true,
                product_variants: { where: { is_active: true } } // Include variants for price info
            }
        });

        const formatted = products.map(p => {
            let imageUrl = null;
            try {
                const images = p.images ? JSON.parse(p.images) : [];
                if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
            } catch (e) { }

            // Determine display price (base price or first variant price)
            let displayPrice = parseFloat(p.price);
            if (p.product_variants && p.product_variants.length > 0) {
                // You might want logic here to show "From $X" or specific variant price
                // For now, keep base price or override if base is 0
                if (displayPrice === 0) displayPrice = parseFloat(p.product_variants[0].price);
            }

            return {
                ...p,
                imageUrl: imageUrl || "https://placehold.co/400x400/e2e8f0/4E342E?text=Product",
                category_name: p.categories ? p.categories.name : null,
                price: displayPrice
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
    try {
        const p = await prisma.products.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                categories: true,
                product_variants: {
                    where: { is_active: true }
                },
                reviews: {
                    include: { customers: true }
                }
            }
        });

        if (!p) return res.status(404).json({ error: 'Product not found' });

        let images = [];
        try {
            images = p.images ? JSON.parse(p.images) : [];
        } catch (e) { }

        const formatted = {
            ...p,
            imageUrl: images.length > 0 ? images[0] : "https://placehold.co/600x600/e2e8f0/4E342E?text=Product",
            images,
            category_name: p.categories ? p.categories.name : null,
            price: parseFloat(p.price),
            variants: p.product_variants.map(v => ({ ...v, price: parseFloat(v.price) }))
        };

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    const { items, currency = 'usd' } = req.body;
    let totalAmount = 0;

    console.log("Creating Payment Intent:", items);

    try {
        for (const item of items) {
            let price = 0;
            if (item.variant_id) {
                const v = await prisma.product_variants.findUnique({ where: { id: item.variant_id } });
                if (v) price = parseFloat(v.price);
            } else if (item.id) {
                const p = await prisma.products.findUnique({ where: { id: item.id } });
                if (p) price = parseFloat(p.price);
            }
            totalAmount += price * item.quantity;
        }

        console.log(`Total Amount: ${totalAmount}`);
        if (totalAmount === 0) throw new Error("Total amount is 0");

        const stripe = require('stripe')(config.stripe_secret_key || process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency,
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Create Order
app.post('/api/orders', async (req, res) => {
    const { user_id, items, total_price, payment_intent_id } = req.body;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        // Use Prisma interaction (transaction is implicit if needed, but here simple create is fine or we use $transaction)
        const order = await prisma.orders.create({
            data: {
                customer_id: user_id ? parseInt(user_id) : null, // Handle guest checkout if needed or require auth
                order_number: orderNumber,
                total_amount: total_price,
                subtotal: total_price, // Assuming no tax/shipping calc for now
                payment_method: 'Stripe',
                status: 'Processing',
                created_at: new Date(),
                updated_at: new Date(),
                transactions: {
                    create: {
                        amount: total_price,
                        provider: 'STRIPE',
                        provider_tx_id: payment_intent_id,
                        status: 'PENDING'
                    }
                },
                order_items: {
                    create: items.map(item => ({
                        product_id: item.product_id || item.id, // Frontend uses 'id' sometimes for product_id
                        variant_id: item.variant_id || null,
                        quantity: item.quantity,
                        price: item.price,
                        total_price: item.price * item.quantity
                    }))
                }
            }
        });

        console.log("Order Created:", order.id);
        res.status(201).json({ message: 'Order created', orderId: order.id, orderNumber });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Handle SPA (Serve index.html for any unknown routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

loadConfig().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
