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

// Load Config from DB (app_configs table)
let config = {};
const loadConfig = async () => {
    try {
        const configs = await prisma.app_configs.findMany();
        configs.forEach(c => {
            config[c.key] = c.value;
        });
        console.log("Configuration loaded from DB");
    } catch (e) {
        console.error("Failed to load config from DB", e);
    }
};

// Register (Customers)
app.post('/api/auth/register', async (req, res) => {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    try {
        const existing = await prisma.customers.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.customers.create({
            data: {
                first_name: full_name.split(' ')[0],
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

// Login (Customer or Admin)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Try finding in Admins table first (for Admin Portal access)
        const admin = await prisma.admins.findUnique({ where: { email } });
        if (admin && admin.password_hash) {
            const validAdmin = await bcrypt.compare(password, admin.password_hash);
            if (validAdmin) {
                const token = jwt.sign(
                    { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return res.json({
                    message: 'Admin Login successful',
                    token,
                    user: { id: admin.id, full_name: admin.name, email: admin.email, role: admin.role }
                });
            }
        }

        // 2. Fallback to Customers table
        const user = await prisma.customers.findUnique({ where: { email } });
        if (!user || !user.password_hash) return res.status(400).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email, type: 'customer' },
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
                { name: { contains: search } },
                { description: { contains: search } },
                { categories: { name: { contains: search } } }
            ];
        }

        // Note: Introspected schema uses snake_case relations typically if mapped 
        // but let's check exact names. In schema.prisma:
        // products has `categories` relation.
        // product_variants has `products` relation. 
        const products = await prisma.products.findMany({
            where: whereClause,
            include: {
                categories: true,
                product_variants: { where: { is_active: true } }
            }
        });

        const formatted = products.map(p => {
            let imageUrl = null;
            try {
                // Ensure we handle potential null/empty images safely
                const images = p.images ? JSON.parse(p.images) : [];
                if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
            } catch (e) { }

            // Determine display price
            let displayPrice = parseFloat(p.price);
            if (p.product_variants && p.product_variants.length > 0) {
                // Often useful to show lowest variant price if main price is 0
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

// ... (Product Details similar update if needed, but looks ok as fields match)

// --- ADMIN ROUTES ---
const checkAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        // Check for 'admin' type or specific role logic if needed
        if (req.user && (req.user.type === 'admin' || req.user.email === 'admin@yemeni.market')) {
            next();
        } else {
            return res.sendStatus(403);
        }
    });
};

// Admin Stats
app.get('/api/admin/stats', checkAdmin, async (req, res) => {
    try {
        const totalRevenue = await prisma.orders.aggregate({
            _sum: { total_amount: true }
        });
        const totalOrders = await prisma.orders.count();
        const pendingOrders = await prisma.orders.count({ where: { status: 'Processing' } });
        const totalProducts = await prisma.products.count();

        res.json({
            totalRevenue: totalRevenue._sum.total_amount || 0,
            totalOrders,
            pendingOrders,
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Admin: Get Orders
app.get('/api/admin/orders', checkAdmin, async (req, res) => {
    try {
        const orders = await prisma.orders.findMany({
            include: { customers: true },
            orderBy: { created_at: 'desc' }
        });

        const formatted = orders.map(o => ({
            ...o,
            first_name: o.customers?.first_name || 'Guest',
            last_name: o.customers?.last_name || '',
            total_amount: parseFloat(o.total_amount)
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin: Create Product
app.post('/api/admin/products', checkAdmin, async (req, res) => {
    const { name, description, price, category_name, stock } = req.body;
    try {
        // Use 'Category' model name from schema.prisma if it was capitalized there
        // Actually schema says `model Category` but map is `categories`. 
        // Prisma Client usually uses the Model name.
        // Let's check imports. `const { PrismaClient } = require('@prisma/client');`
        // We'll trust `prisma.category` works if model is `Category` (uncapitalized property usually if mapped? No, strictly key sensitive).
        // Wait, schema has `model Category`. Client property is `prisma.category`.

        let category = await prisma.category.findFirst({ where: { name: category_name } });
        if (!category && category_name) {
            category = await prisma.category.create({ data: { name: category_name, slug: category_name.toLowerCase().replace(/\s+/g, '-') } });
        }

        const product = await prisma.products.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock_quantity: parseInt(stock) || 0,
                slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                categories: category ? { connect: { id: category.id } } : undefined,
                is_active: true
            }
        });
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

loadConfig().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
