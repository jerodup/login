import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// Routes
app.use('/api/auth', authRoutes);

export default app;