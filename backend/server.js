const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Middleware
// ⚠️ Use exact origin when credentials are true
app.use(cors({
    origin: 'http://127.0.0.1:5500', // frontend origin
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve front-end
app.use(express.static(path.join(__dirname, 'bella-cucina-frontend')));

// Optional SPA fallback (if using a single-page app)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next(); // skip API routes
    res.sendFile(path.join(__dirname, 'bella-cucina-frontend', 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Bella Cucina API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 bella-cucina restaurant available at http://localhost:${PORT}`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
