import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 

import authRoutes from './routes/authRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  // Use a function to dynamically check if the origin is allowed
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://promtforge-frontend.vercel.app', 
      'http://localhost:3000' // Keeps your local development working!
    ];
    // If there is no origin (like a backend-to-backend request), or if it matches our list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};

app.use(cors(corsOptions));

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/seller', sellerRoutes); 
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the PromptForge API!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on http://localhost:${PORT}`);
});