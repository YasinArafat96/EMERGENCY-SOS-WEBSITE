const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { initializeSocket } = require('./config/socket');

dotenv.config();

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const emergencyRoutes = require('./routes/emergency');
const chatRoutes = require('./routes/chat');
const bloodRoutes = require('./routes/blood');
const communityRoutes = require('./routes/community');
const paymentRoutes = require('./routes/payment');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
// In development, allow a higher limit to avoid blocking dev hot-reload traffic
const RATE_LIMIT_MAX = process.env.NODE_ENV === 'production' ? 100 : 10000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: RATE_LIMIT_MAX, // higher limit in dev to avoid blocking normal usage
});
app.use('/api', limiter);

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any origin in production to be safe with Vercel preview URLs
    if (process.env.NODE_ENV === 'production') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Seed demo data (non-blocking)
const seedDemoData = require('./config/seed');
setTimeout(() => {
  seedDemoData().catch(err => console.warn('Seed skipped:', err.message));
}, 1500);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Emergency SOS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO
initializeSocket(server);

module.exports = { app, server };