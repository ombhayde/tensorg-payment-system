const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

dotenv.config();
console.log("Stripe Secret Key loaded by server:", process.env.STRIPE_SECRET_KEY);

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// --- Database Setup ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    isAdmin: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: String,
    productName: String,
    amount: Number,
    date: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

// --- Middleware ---
// IMPORTANT: Stripe webhook needs raw body, so we apply express.json after the webhook route
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: process.env.CLIENT_URL, // This uses the URL from your .env file
  credentials: true                // This allows cookies and sessions
}));

// --- Dummy Product Data ---
const products = [
    { id: 'prod_1', name: 'VisionAI Pro', price: 4900, image: 'https://techcrunch.com/wp-content/uploads/2024/06/Apple-Vision-Pro-global-availability-e1718041644616.jpg?resize=1095,617' },
    { id: 'prod_2', name: 'NLP Toolkit', price: 7900, image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347529819i/6817045.jpg' },
    { id: 'prod_3', name: 'GenAI Suite', price: 9900, image: 'https://www.amdocs.com/sites/default/files/2025-02/girl-city-lights-glasses-ai.png' },
];

// --- Nodemailer Email Transporter ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendPaymentNotification(order) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `🎉 New Payment Received for ${order.productName}`,
        html: `
            <h1>Payment Notification</h1>
            <p>A payment has been successfully processed.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>User:</strong> ${order.userEmail}</li>
                <li><strong>Product:</strong> ${order.productName}</li>
                <li><strong>Amount:</strong> ₹${(order.amount / 100).toFixed(2)}</li>
                <li><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</li>
            </ul>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully!');
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
}

// --- Passport.js Google OAuth2 Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            const isAdmin = profile.emails[0].value === process.env.SUPER_ADMIN_EMAIL;
            user = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                isAdmin: isAdmin,
            });
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

// --- API Routes ---

// Stripe Webhook Handler (MUST BE BEFORE express.json())
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, userEmail, productName, amount } = session.metadata;

        // Create a new order in the database
        const newOrder = new Order({ userId, userEmail, productName, amount });
        await newOrder.save();

        // Send email notification to super admin
        await sendPaymentNotification(newOrder);
    }

    res.status(200).json({ received: true });
});

// Regular JSON middleware
app.use(express.json());

// Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: `${process.env.CLIENT_URL}/login/failed`,
}));

// Check User Session
app.get('/api/user', (req, res) => {
    res.send(req.user); // Passport attaches user to req object
});

// Logout
app.post('/api/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.json({ message: "Logged out successfully" });
        });
    });
});

// Products Route
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Stripe Checkout Route
app.post('/api/create-checkout-session', async (req, res) => {
    const { product, user } = req.body;

    if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: product.name,
                    images: [product.image],
                },
                unit_amount: product.price,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: {
            userId: user._id.toString(),
            userEmail: user.email,
            productName: product.name,
            amount: product.price,
        }
    });

    res.json({ id: session.id });
});

// Admin Route to get all orders
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.status(403).json({ error: 'Forbidden: Admins only' });
}

app.get('/api/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));