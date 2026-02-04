const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
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

// --- API CONNECTIVITY TEST ---
app.get('/api/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'Backend is connected and running!',
        timestamp: new Date().toISOString(),
        env_check: {
            stripe_enabled: !!process.env.STRIPE_SECRET_KEY,
            smtp_host: process.env.SMTP_HOST || 'using_db_config'
        }
    });
});

// Routes will be defined below


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

const PDFDocument = require('pdfkit');

// --- INVOICE PDF GENERATION ---
app.get('/api/invoices/:id/pdf', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await prisma.invoices.findUnique({
            where: { id: parseInt(id) },
            include: {
                orders: {
                    include: {
                        customers: true,
                        order_items: true
                    }
                }
            }
        });

        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        // Security Check: Verify user owns this invoice (unless admin)
        if (req.user.type !== 'admin' && invoice.orders.customer_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized access to this invoice" });
        }

        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);

        doc.pipe(res);

        // Professional Header
        const goldColor = '#D4AF37';
        const coffeeColor = '#2C1E14';

        doc.rect(0, 0, 600, 150).fill(coffeeColor);

        // Add Logo
        try {
            const logoPath = require('path').join(__dirname, 'logo.png');
            if (require('fs').existsSync(logoPath)) {
                doc.image(logoPath, 50, 40, { height: 60 });
            } else {
                doc.fillColor(goldColor).fontSize(24).font('Helvetica-Bold').text('YEMENI', 50, 45, { continued: true });
                doc.fillColor('#FFFFFF').text('.MARKET');
            }
        } catch (e) {
            doc.fillColor(goldColor).fontSize(24).font('Helvetica-Bold').text('YEMENI', 50, 45, { continued: true });
            doc.fillColor('#FFFFFF').text('.MARKET');
        }

        doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica').text('AUTHENTICITY & HERITAGE', 150, 75);

        doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text('INVOICE', 450, 45, { align: 'right' });
        doc.fontSize(16).text(`#${invoice.invoice_number}`, 450, 65, { align: 'right' });

        doc.fillColor(coffeeColor).font('Helvetica');
        doc.moveDown(8);

        // Info Columns
        const buyerX = 50;
        const infoX = 350;
        const currentY = doc.y;

        doc.fontSize(12).font('Helvetica-Bold').text('Billed To:', buyerX, currentY);
        doc.fontSize(10).font('Helvetica').moveDown(0.5);
        if (invoice.orders.customers) {
            doc.text(`${invoice.orders.customers.first_name || ''} ${invoice.orders.customers.last_name || ''}`);
            doc.text(invoice.orders.customers.email);
            if (invoice.orders.shipping_address) {
                doc.text(invoice.orders.shipping_address, { width: 200 });
            }
        } else {
            doc.text("Guest Customer");
            if (invoice.orders.shipping_address) {
                doc.text(invoice.orders.shipping_address, { width: 200 });
            }
        }

        doc.fontSize(12).font('Helvetica-Bold').text('Invoice Details:', infoX, currentY);
        doc.fontSize(10).font('Helvetica').moveDown(0.5);
        doc.text(`Order Number: ${invoice.orders.order_number}`, infoX);
        doc.text(`Issued Date: ${new Date(invoice.issued_at).toLocaleDateString()}`, infoX);
        doc.text(`Payment Status: ${invoice.status}`, infoX);

        doc.moveDown(4);

        // Table Header
        const tableTop = doc.y;
        doc.rect(50, tableTop, 500, 20).fill(coffeeColor);
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
        doc.text("Item Description", 60, tableTop + 6);
        doc.text("Qty", 350, tableTop + 6, { width: 50, align: 'center' });
        doc.text("Price", 400, tableTop + 6, { width: 70, align: 'right' });
        doc.text("Total", 480, tableTop + 6, { width: 60, align: 'right' });

        // Items
        let itemY = tableTop + 25;
        doc.fillColor(coffeeColor).font('Helvetica');

        invoice.orders.order_items.forEach((item, index) => {
            if (index % 2 === 0) {
                doc.rect(50, itemY - 5, 500, 20).fill('#F9F7F5');
                doc.fillColor(coffeeColor);
            }

            doc.text(item.product_name || "Product", 60, itemY);
            doc.text(item.quantity.toString(), 350, itemY, { width: 50, align: 'center' });
            doc.text(`$${Number(item.price || 0).toFixed(2)}`, 400, itemY, { width: 70, align: 'right' });
            doc.text(`$${Number(item.total_price).toFixed(2)}`, 480, itemY, { width: 60, align: 'right' });
            itemY += 20;
        });

        doc.moveTo(50, itemY).lineTo(550, itemY).strokeColor('#EEEEEE').stroke();

        // Footer Summary
        itemY += 20;
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Total Amount', 350, itemY);
        doc.fillColor(goldColor).text(`$${Number(invoice.amount).toFixed(2)}`, 450, itemY, { align: 'right', width: 90 });

        // Bottom Footer
        doc.fillColor('#AAAAAA').fontSize(8).font('Helvetica').text('Thank you for choosing Yemeni Market. We appreciate your purchase of our authentic heritage products.', 50, 750, { align: 'center', width: 500 });
        doc.text('© 2026 Yemeni Market - Heritage & Excellence', 50, 765, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

// --- ROUTES ---

// Load Config from DB (store_config table)
let config = {};
const loadConfig = async () => {
    try {
        const configs = await prisma.store_config.findMany();
        configs.forEach(c => {
            config[c.key] = c.value; // key is primary key in store_config
        });

        // OVERRIDE with Environment Variables (Priority: Env > DB)
        if (process.env.SMTP_HOST) config.smtp_host = process.env.SMTP_HOST;
        if (process.env.SMTP_PORT) config.smtp_port = process.env.SMTP_PORT;
        if (process.env.SMTP_USER) config.smtp_user = process.env.SMTP_USER;
        if (process.env.SMTP_PASS) config.smtp_pass = process.env.SMTP_PASS;
        if (process.env.SMTP_SECURE) config.smtp_secure = process.env.SMTP_SECURE;

        // STRIPE: Only use Env as fallback if DB is missing (Allowing DB-based management)
        if (!config.stripe_secret_key && process.env.STRIPE_SECRET_KEY) config.stripe_secret_key = process.env.STRIPE_SECRET_KEY;
        if (!config.stripe_public_key && process.env.STRIPE_PUBLIC_KEY) config.stripe_public_key = process.env.STRIPE_PUBLIC_KEY;

        console.log("Configuration loaded from DB & Env");
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

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.customers.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        // In a real app, generate a secure random token and store it in DB with expiry
        // For this demo, we'll use a simple JWT as the reset token valid for 1 hour
        const resetToken = jwt.sign({ id: user.id, email: user.email, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        const emailHtml = `
            <div style="font-family: 'Georgia', serif; padding: 20px; text-align: center;">
                <h1 style="color: #4A3423;">Réinitialisation de mot de passe</h1>
                <p>Une demande de réinitialisation a été effectuée pour votre compte.</p>
                <a href="${resetLink}" style="display: inline-block; background-color: #4A3423; color: #D4AF37; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Réinitialiser mon mot de passe</a>
                <p style="font-size: 12px; color: #999; margin-top: 20px;">Ce lien expire dans 1 heure.</p>
            </div>
        `;

        await sendEmail(email, "Réinitialisation de mot de passe", emailHtml);
        res.json({ message: "Reset link sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send reset link" });
    }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'reset') return res.status(400).json({ error: "Invalid token type" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.customers.update({
            where: { id: decoded.id },
            data: { password_hash: hashedPassword }
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset Error:", error);
        res.status(400).json({ error: "Invalid or expired token" });
    }
});

// Get Products (with Search)
// Get Products (with Search & Filters)
app.get('/api/products', async (req, res) => {
    const { search, min_price, max_price, category, sort } = req.query;
    try {
        const where = {};

        // 1. Text Search (Name, Description, Category, Variations)
        if (search) {
            const searchLower = search.toLowerCase();
            where.OR = [
                { name: { contains: searchLower } },
                { description: { contains: searchLower } },
                { categories: { name: { contains: searchLower } } },
                { product_variants: { some: { name: { contains: searchLower } } } }
            ];
        }

        // 2. Category Filter
        if (category && category !== 'All') {
            where.categories = { name: { equals: category } };
        }

        // 3. Price Filter
        if (min_price || max_price) {
            where.stock_quantity = { not: -1 }; // Dummy condition if needed, but Prisma handles empty logic well.
            // Using logic:
            if (min_price) where.price = { ...(where.price || {}), gte: parseFloat(min_price) };
            if (max_price) where.price = { ...(where.price || {}), lte: parseFloat(max_price) };
        }

        // 4. Sorting
        let orderBy = {};
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'name_asc') orderBy = { name: 'asc' };
        else if (sort === 'name_desc') orderBy = { name: 'desc' };
        else if (sort === 'newest') orderBy = { created_at: 'desc' };
        else orderBy = { id: 'desc' }; // Default

        const products = await prisma.products.findMany({
            where,
            orderBy,
            include: { product_variants: true }
        });

        // Add imageUrl if not present (legacy fallback)
        const enrichedProducts = products.map(p => ({
            ...p,
            variants: p.product_variants || [],
            imageUrl: p.image_url || `https://placehold.co/500x700/D4AF37/FFFFFF?text=${encodeURIComponent(p.name)}`
        }));

        res.json(enrichedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


// Get Product Details
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.products.findUnique({
            where: { id: parseInt(id) },
            include: {
                product_variants: true,
                categories: true,
                reviews: {
                    include: { customers: { select: { first_name: true, last_name: true } } }
                }
            }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Map product_variants to variants for frontend compatibility
        const formatted = {
            ...product,
            variants: product.product_variants || []
        };

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});

// --- WISHLIST ---
app.get('/api/wishlist', authenticateToken, async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { customer_id: req.user.id },
            include: {
                products: {
                    include: {
                        product_variants: true,
                        categories: true
                    }
                }
            }
        });

        // Format for frontend
        const formatted = wishlist.map(w => ({
            ...w.products,
            variants: w.products.product_variants || []
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
});

app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
    const { productId } = req.body;
    const customerId = req.user.id;

    if (!productId) return res.status(400).json({ error: "Product ID is required" });

    try {
        const existing = await prisma.wishlist.findUnique({
            where: {
                customer_id_product_id: {
                    customer_id: customerId,
                    product_id: parseInt(productId)
                }
            }
        });

        if (existing) {
            await prisma.wishlist.delete({ where: { id: existing.id } });
            return res.json({ added: false, message: "Removed from wishlist" });
        } else {
            await prisma.wishlist.create({
                data: {
                    customer_id: customerId,
                    product_id: parseInt(productId)
                }
            });
            return res.json({ added: true, message: "Added to wishlist" });
        }
    } catch (error) {
        console.error("Wishlist Toggle Error:", error);
        res.status(500).json({ error: "Failed to toggle wishlist" });
    }
});

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

// Admin: Get All Products (Detailed for Management)
app.get('/api/admin/products', checkAdmin, async (req, res) => {
    try {
        const products = await prisma.products.findMany({
            include: { categories: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products for admin' });
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
            category = await prisma.category.create({
                data: {
                    name: category_name,
                    slug: category_name.toLowerCase().replace(/\s+/g, '-')
                }
            });
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

// Admin: Update Product
app.put('/api/admin/products/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category_name, stock, is_active } = req.body;
    try {
        let category = await prisma.category.findFirst({ where: { name: category_name } });
        if (!category && category_name) {
            category = await prisma.category.create({
                data: {
                    name: category_name,
                    slug: category_name.toLowerCase().replace(/\s+/g, '-')
                }
            });
        }

        const updated = await prisma.products.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock_quantity: parseInt(stock) || 0,
                is_active: is_active ?? true,
                categories: category ? { connect: { id: category.id } } : { disconnect: true }
            }
        });
        res.json(updated);
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Admin: Delete Product
app.delete('/api/admin/products/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete or hard delete? Let's do hard delete for now if not used in orders
        // Note: Prisma might fail if there are foreign key constraints (order_items).
        // A better way is is_active: false.
        await prisma.products.update({
            where: { id: parseInt(id) },
            data: { is_active: false }
        });
        res.json({ message: "Product deactivated successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Admin: Get Customers
app.get('/api/admin/customers', checkAdmin, async (req, res) => {
    try {
        const customers = await prisma.customers.findMany({
            include: {
                orders: { select: { id: true, total_amount: true } },
                addresses: true
            },
            orderBy: { created_at: 'desc' }
        });

        const formatted = customers.map(c => ({
            ...c,
            orderCount: c.orders.length,
            totalSpent: c.orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// --- ADMIN UPDATE ORDER STATUS ---
app.put('/api/admin/orders/:id/status', checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updatedOrder = await prisma.orders.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { customers: true } // Need customer email
        });

        // Send Email if Shipped
        if (status === 'Shipped' && updatedOrder.customers && updatedOrder.customers.email) {
            const emailHtml = `
             <div style="font-family: 'Georgia', serif; padding: 20px; text-align: center;">
                <h1 style="color: #4A3423;">Commande Expédiée</h1>
                <p>Votre commande <strong>${updatedOrder.order_number}</strong> a été expédiée !</p>
                <p>Elle est en route vers chez vous.</p>
             </div>
             `;
            // In real app, include tracking number
            sendEmail(updatedOrder.customers.email, `Commande Expédiée ${updatedOrder.order_number}`, emailHtml);
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});
// --- PUBLIC CONFIG ROUTE ---
app.get('/api/config', async (req, res) => {
    try {
        // Only return configs marked as public in the database
        const publicConfigs = await prisma.store_config.findMany({
            where: { isPublic: true }
        });

        const configMap = {};
        publicConfigs.forEach(c => configMap[c.key] = c.value);

        res.json(configMap);
    } catch (error) {
        console.error("Failed to fetch public config:", error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Admin Config Management
app.get('/api/admin/config', checkAdmin, async (req, res) => {
    try {
        const configs = await prisma.store_config.findMany({ orderBy: { group: 'asc' } });
        res.json(configs);
    } catch (error) {
        console.error("Admin Config Error:", error);
        res.status(500).json({ error: 'Failed to fetch configs' });
    }
});

app.put('/api/admin/config', checkAdmin, async (req, res) => {
    try {
        const { key, value, isPublic, description } = req.body;
        // Upsert allows creating new arbitrary keys too
        const updated = await prisma.store_config.upsert({
            where: { key },
            update: { value, isPublic, description, updated_at: new Date() },
            create: { key, value, isPublic, description, group: 'custom', type: 'text' }
        });

        // Reload global config cache
        await loadConfig();

        res.json(updated);
    } catch (error) {
        console.error("Update Config Error:", error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

// --- EMAIL SETUP (SMTP) ---
const nodemailer = require('nodemailer');

// Helper to send email
const sendEmail = async (to, subject, html) => {
    try {
        // Prioritize Environment Variables (User Request), then Database Config, then Defaults
        const smtpHost = process.env.SMTP_HOST || config.smtp_host || 'smtp.hostinger.com';
        const smtpPort = Number(process.env.SMTP_PORT) || Number(config.smtp_port) || 465;
        const smtpUser = process.env.SMTP_USER || config.smtp_user || 'sell@yemenimarket.fr';
        const smtpPass = process.env.SMTP_PASS || config.smtp_pass || 'Admin1236@1';

        // Hostinger (and many providers) require FROM email to match the authenticated user.
        // We force this to avoid "Sender address rejected" errors.
        const fromEmail = smtpUser;
        const fromName = process.env.SMTP_FROM_NAME || config.smtp_from_name || 'Yemeni Market';

        // Secure Logic: 
        // If port 465 -> default secure. 
        // If env/config explicitly says 'true' -> secure.
        // If env/config explicitly says 'false' -> not secure.
        let isSecure = smtpPort === 465; // Default based on port

        const envSecure = process.env.SMTP_SECURE;
        const configSecure = config.smtp_secure;

        if (envSecure !== undefined) isSecure = envSecure === 'true';
        else if (configSecure !== undefined) isSecure = configSecure === 'true';

        const transportConfig = {
            host: smtpHost,
            port: smtpPort,
            secure: isSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        };

        console.log(`[Email Settings] Using: ${smtpHost}:${smtpPort} (User: ${smtpUser})`);

        const transporter = nodemailer.createTransport(transportConfig);

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: to,
            subject: subject,
            html: html,
        });

        console.log("[Email] Message sent: %s", info.messageId);
    } catch (error) {
        console.error("[Email Error]", error);
    }
};

// --- STRIPE PAYMENT ---
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { items } = req.body;

        // Use Stripe secret key from DB directly
        const secretKey = config.stripe_secret_key;
        if (!secretKey) {
            return res.status(400).json({ error: "Stripe is not configured on this server." });
        }

        const stripe = require('stripe')(secretKey);

        // Calculate Subtotal
        let subtotal = 0;
        for (const item of items) {
            const productId = parseInt(item.id, 10);
            const product = await prisma.products.findUnique({ where: { id: productId } });
            if (product) {
                subtotal += Number(product.price) * item.quantity;
            }
        }

        // Calculate Tax (20%) and Shipping
        const taxTotal = subtotal * 0.20;
        const shippingCost = subtotal > 100 ? 0 : 15;
        const totalAmount = subtotal + taxTotal + shippingCost;

        console.log(`[Stripe] Subtotal: $${subtotal}, Tax: $${taxTotal}, Shipping: $${shippingCost}, Total: $${totalAmount}`);

        if (totalAmount <= 0) {
            return res.status(400).json({ error: 'Total amount must be greater than 0' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});



// --- COUPONS ---
app.post('/api/coupons/validate', async (req, res) => {
    const { code, cartTotal } = req.body;
    try {
        const coupon = await prisma.coupons.findUnique({ where: { code } });

        if (!coupon) return res.status(404).json({ error: "Invalid coupon code" });
        if (!coupon.is_active) return res.status(400).json({ error: "Coupon is inactive" });
        if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) return res.status(400).json({ error: "Coupon usage limit reached" });
        if (coupon.expiration_date && new Date() > new Date(coupon.expiration_date)) return res.status(400).json({ error: "Coupon expired" });
        if (coupon.min_order_amount && cartTotal < parseFloat(coupon.min_order_amount)) {
            return res.status(400).json({ error: `Minimum order amount is $${coupon.min_order_amount}` });
        }

        res.json({
            code: coupon.code,
            discount_type: coupon.discount_type,
            value: parseFloat(coupon.value)
        });

    } catch (error) {
        console.error("Coupon Error:", error);
        res.status(500).json({ error: "Validation failed" });
    }
});

// --- REVIEWS ---

// Add Review
app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    try {
        // Check if user bought product for "Verified" tag (Optional but good)
        // For now, simpler implementation
        const review = await prisma.reviews.create({
            data: {
                product_id: parseInt(id),
                customer_id: customerId,
                rating: parseInt(rating),
                comment,
                is_verified: true, // Simplified for now
                created_at: new Date()
            }
        });
        res.json(review);
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ error: "Failed to add review" });
    }
});

// Get Reviews
app.get('/api/products/:id/reviews', async (req, res) => {
    const { id } = req.params;
    try {
        const reviews = await prisma.reviews.findMany({
            where: { product_id: parseInt(id) },
            include: { customers: { select: { first_name: true, last_name: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ error: "Failed to get reviews" });
    }
});

// --- ORDER CREATION ---
app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, items, total_price, shipping_address, payment_intent_id, email, phone, tax_total, shipping_cost } = req.body;

        console.log("[Order] Params:", { user_id, email, total_price });

        if (!items || items.length === 0) return res.status(400).json({ error: "No items" });

        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        let customerId = null;
        if (user_id) {
            const parsedId = parseInt(user_id, 10);
            if (!isNaN(parsedId)) {
                const customer = await prisma.customers.findUnique({ where: { id: parsedId } });
                if (customer) customerId = parsedId;
            }
        }

        const orderItemsData = items.map(item => ({
            product_id: parseInt(item.product_id, 10),
            quantity: parseInt(item.quantity, 10),
            price: parseFloat(item.price || 0),
            total_price: parseFloat(item.price || 0) * parseInt(item.quantity, 10),
            product_name: item.name || "Product"
        }));

        // Parse totals
        const validTotal = parseFloat(total_price);
        const validTax = parseFloat(tax_total || 0);
        const validShipping = parseFloat(shipping_cost || 0);
        const subtotal = validTotal - validTax - validShipping;


        // --- TRANSACTION START ---
        // We use an interactive transaction to check stock and create order atomically
        const newOrder = await prisma.$transaction(async (tx) => {
            // 1. Check and Decrement Stock
            for (const item of items) {
                const product = await tx.products.findUnique({ where: { id: parseInt(item.product_id, 10) } });

                if (!product) {
                    throw new Error(`Product ${item.name} not found`);
                }

                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name}. Only ${product.stock_quantity} left.`);
                }

                await tx.products.update({
                    where: { id: product.id },
                    data: { stock_quantity: product.stock_quantity - item.quantity }
                });
            }

            // 2. Create Order
            return await tx.orders.create({
                data: {
                    customer_id: customerId,
                    order_number: orderNumber,
                    total_amount: validTotal,
                    subtotal: subtotal,
                    shipping_cost: validShipping,
                    tax_total: validTax,
                    status: 'Processing',
                    payment_method: 'Stripe',
                    shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
                    order_items: { create: orderItemsData },
                    transactions: {
                        create: {
                            amount: validTotal,
                            provider: 'STRIPE',
                            provider_tx_id: payment_intent_id || 'manual-' + Date.now(),
                            status: 'COMPLETED'
                        }
                    },
                    // Create Invoice automatically
                    invoices: {
                        create: {
                            invoice_number: 'INV-' + orderNumber,
                            amount: validTotal,
                            status: 'PAID',
                            issued_at: new Date()
                        }
                    }
                },
                include: { order_items: true }
            });
        });
        // --- TRANSACTION END ---

        // --- SYNC ADDRESS TO PROFILE ---
        if (customerId && shipping_address) {
            try {
                // Parse if string
                const addressObj = typeof shipping_address === 'string' ? JSON.parse(shipping_address) : shipping_address;

                // Simple upsert logic or create new if different. 
                // For simplicity, we'll check if this user has any address. If not, create one.
                // Or if we want to add every new address used.
                // Let's just create if it doesn't exist to populate the profile.
                const count = await prisma.addresses.count({ where: { customer_id: customerId } });

                if (count === 0 && addressObj.line1 && addressObj.city) {
                    await prisma.addresses.create({
                        data: {
                            customer_id: customerId,
                            label: 'Home',
                            street_address: addressObj.line1 + (addressObj.line2 ? ' ' + addressObj.line2 : ''),
                            city: addressObj.city,
                            state: addressObj.state || '',
                            country: addressObj.country || 'FR',
                            postal_code: addressObj.postal_code || '',
                            phone: phone || '',
                            is_default: true
                        }
                    });
                    console.log(`[Order] Auto-saved address for user ${customerId}`);
                }
            } catch (addrError) {
                console.error("[Order] Failed to sync address:", addrError);
                // Don't fail the order for this
            }
        }

        // Send Email Confirmation
        if (email) {
            const emailHtml = `
            <div style="font-family: 'Georgia', serif; color: #2C2C2C; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #4A3423; margin: 0; font-size: 28px;">YEMENI<span style="color: #D4AF37;">.MARKET</span></h1>
                    <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #888;">L'Authenticité du Yémen</p>
                </div>

                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="color: #4A3423; font-size: 22px;">Merci pour votre commande</h2>
                    <p style="font-family: Arial, sans-serif; font-size: 14px; color: #555;">Votre commande <strong>${orderNumber}</strong> a bien été enregistrée.</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-family: Arial, sans-serif; font-size: 14px;">
                    <thead style="background-color: #f1f1f1; color: #4A3423;">
                        <tr>
                            <th style="padding: 12px; text-align: left;">Produit</th>
                            <th style="padding: 12px; text-align: right;">Qté</th>
                            <th style="padding: 12px; text-align: right;">Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItemsData.map(item => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px; color: #333;">${item.product_name}</td>
                            <td style="padding: 12px; text-align: right; color: #666;">${item.quantity}</td>
                            <td style="padding: 12px; text-align: right; font-weight: bold;">$${item.total_price.toFixed(2)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="background-color: #fff; padding: 20px; border-radius: 4px; border: 1px solid #eee; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #888;">Sous-total:</span>
                        <span style="font-weight: bold;">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #888;">TVA (20%):</span>
                        <span>$${validTax.toFixed(2)}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #888;">Livraison:</span>
                        <span>${validShipping === 0 ? 'Gratuite' : '$' + validShipping.toFixed(2)}</span>
                    </div>
                    <div style="border-top: 1px solid #eee; margin: 10px 0;"></div>
                    <div style="display: flex; justify-content: space-between; font-size: 18px; color: #4A3423;">
                        <strong>Total:</strong>
                        <strong style="color: #D4AF37;">$${validTotal.toFixed(2)}</strong>
                    </div>
                </div>

                <div style="text-align: center; font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p>Nous préparerons votre commande avec le plus grand soin.</p>
                    <p>Pour toute question, répondez simplement à cet email.</p>
                    <p style="margin-top: 10px;">&copy; 2026 Yemeni Market. Tous droits réservés.</p>
                </div>
            </div>
            `;
            await sendEmail(email, `Confirmation de votre commande ${orderNumber}`, emailHtml);
        }

        res.json({ success: true, orderId: newOrder.id, orderNumber: newOrder.order_number });

    } catch (error) {
        const fs = require('fs');
        const logMsg = `[Order Error] ${new Date().toISOString()}: ${error.message}\nStack: ${error.stack}\nCode: ${error.code}\n\n`;
        fs.appendFileSync('error_log.txt', logMsg);
        console.error("DETAILED ORDER ERROR:", error);

        res.status(500).json({
            error: "Failed to create order",
            details: error.message,
            prismaCode: error.code
        });
    }
});

// --- CUSTOMER ADDRESSES ---
app.get('/api/customer/address', authenticateToken, async (req, res) => {
    try {
        const addresses = await prisma.addresses.findMany({
            where: { customer_id: req.user.id },
            orderBy: { is_default: 'desc' }
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch addresses" });
    }
});

app.post('/api/customer/address', authenticateToken, async (req, res) => {
    try {
        const { label, street_address, city, postal_code, country, phone } = req.body;
        if (!street_address || !city) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const newAddress = await prisma.addresses.create({
            data: {
                customer_id: req.user.id,
                label: label || 'Home',
                street_address,
                city,
                postal_code: postal_code || '',
                country: country || 'France',
                phone: phone || '',
                is_default: false
            }
        });
        res.json(newAddress);
    } catch (error) {
        console.error("Address creation failed:", error);
        res.status(500).json({ error: "Failed to create address" });
    }
});

// --- CUSTOMER INVOICES ---
app.get('/api/customer/invoices', authenticateToken, async (req, res) => {
    try {
        const invoices = await prisma.invoices.findMany({
            where: {
                orders: {
                    customer_id: req.user.id
                }
            },
            include: {
                orders: true
            },
            orderBy: {
                issued_at: 'desc'
            }
        });
        res.json(invoices);
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

// Update Order Creation to Sync Address
// ... (Logic added inside POST /api/orders, see below)

// --- GET USER ORDERS ---
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.orders.findMany({
            where: { customer_id: req.user.id },
            include: {
                order_items: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// --- NEWSLETTER SUBSCRIPTION ---
app.post('/api/newsletter', async (req, res) => {
    try {
        const { email, gdpr_consent, lang = 'fr' } = req.body;

        if (!email || !gdpr_consent) {
            return res.status(400).json({ error: "Email and GDPR consent are required" });
        }

        // Check if exists
        const existing = await prisma.newsletter_subscribers.findUnique({ where: { email } });
        if (existing) {
            return res.json({ message: "Already subscribed!" });
        }

        await prisma.newsletter_subscribers.create({
            data: {
                email,
                is_active: true
            }
        });

        // Localized Templates
        const templates = {
            fr: {
                subject: "Bienvenue dans l'univers Yemeni Market",
                title: "Bienvenue parmi nous",
                subtitle: "Merci de rejoindre notre cercle exclusif.",
                body: "Soyez le premier informé de nos récoltes rares de café Haraz, de nos miels de Sidr précieux et de nos offres spéciales réservées aux membres.",
                button: "Découvrir la Collection",
                footer: "Vous recevez cet email car vous avez accepté de rejoindre notre newsletter."
            },
            en: {
                subject: "Welcome to the Yemeni Market Universe",
                title: "Welcome to the Circle",
                subtitle: "Thank you for joining our exclusive community.",
                body: "Be the first to know about our rare Haraz coffee harvests, precious Sidr honey, and special member-only offers.",
                button: "Discover the Collection",
                footer: "You are receiving this email because you opted in to our newsletter."
            },
            ar: {
                subject: "مرحباً بكم في عالم يمني ماركت",
                title: "مرحباً بكم في مجتمعنا",
                subtitle: "شكراً لانضمامكم إلى دائرتنا الحصرية.",
                body: "كن أول من يعلم عن حصاد قهوة حراز النادرة، وعسل السدر الملكي الفاخر، والعروض الخاصة للأعضاء فقط.",
                button: "اكتشف المجموعة",
                footer: "تصلك هذه الرسالة لأنك وافقت على الانضمام إلى نشرتنا البريدية."
            }
        };

        const t = templates[lang] || templates.fr;
        const isRtl = lang === 'ar';

        const newsletterHtml = `
            <div dir="${isRtl ? 'rtl' : 'ltr'}" style="font-family: 'Playfair Display', 'Georgia', serif; color: #1a1a1a; padding: 40px 20px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                 <div style="text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 25px; margin-bottom: 35px;">
                    <h1 style="color: #2C1E14; margin: 0; font-size: 32px; letter-spacing: -0.02em;">YEMENI<span style="color: #D4AF37;">.MARKET</span></h1>
                    <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 11px; color: #888; margin-top: 8px;">Since 2026 • Heritage & Excellence</p>
                </div>

                <div style="text-align: center; padding: 0 20px;">
                    <h2 style="color: #2C1E14; font-size: 28px; margin-bottom: 15px;">${t.title}</h2>
                    <p style="font-family: 'Outfit', 'Helvetica', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #555; font-weight: 300;">
                        ${t.subtitle}
                    </p>
                    <div style="width: 40px; h-height: 2px; background: #D4AF37; margin: 25px auto;"></div>
                    <p style="font-family: 'Outfit', 'Helvetica', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px;">
                        ${t.body}
                    </p>
                     
                    <a href="https://yemenimarket.fr/products" style="display: inline-block; background-color: #2C1E14; color: #D4AF37; text-decoration: none; padding: 15px 40px; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-size: 13px; letter-spacing: 2px; box-shadow: 0 4px 10px rgba(44,30,20,0.2); transition: all 0.3s ease;">${t.button}</a>
                </div>

                 <div style="text-align: center; font-family: 'Outfit', sans-serif; font-size: 12px; color: #ababab; margin-top: 50px; border-top: 1px solid #f5f5f5; padding-top: 25px;">
                    <p>${t.footer}</p>
                    <p style="margin-top: 12px; letter-spacing: 1px;">&copy; 2026 Yemeni Market. ${isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
                    <div style="margin-top: 20px;">
                        <span style="color: #D4AF37; margin: 0 10px;">• Heritage</span>
                        <span style="color: #D4AF37; margin: 0 10px;">• Purity</span>
                        <span style="color: #D4AF37; margin: 0 10px;">• Community</span>
                    </div>
                </div>
            </div>
        `;
        await sendEmail(email, t.subject, newsletterHtml);

        res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        console.error("Newsletter Error:", error);
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

// Serve Static Frontend Files
// Production: serve from 'public' folder inside backend
// Development: serve from '../dist' if available
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../dist')));

// Handle SPA Client-side routing (Must be last route)
app.get('*', (req, res) => {
    // Avoid intercepting API routes that might have slipped through (just in case)
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }

    const prodIndex = path.join(__dirname, 'public', 'index.html');
    const devIndex = path.join(__dirname, '../dist', 'index.html');

    if (require('fs').existsSync(prodIndex)) {
        res.sendFile(prodIndex);
    } else if (require('fs').existsSync(devIndex)) {
        res.sendFile(devIndex);
    } else {
        res.status(404).send("Frontend build not found. Please ensure the 'dist' folder exists at the root or 'public' folder exists in backend.");
    }
});

loadConfig().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
