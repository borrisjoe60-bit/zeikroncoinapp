import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import transactionRoutes from './routes/transactions';
import portfolioRoutes from './routes/portfolio';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Zeikroncoin API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      wallet: '/api/wallet',
      transactions: '/api/transactions',
      portfolio: '/api/portfolio'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Zeikroncoin API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
