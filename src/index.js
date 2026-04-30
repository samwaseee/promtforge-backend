import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 

import authRoutes from './routes/authRoutes.js';
import promptRoutes from './routes/promptRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes); // <-- Mount the new routes

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the PromptForge API!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on http://localhost:${PORT}`);
});