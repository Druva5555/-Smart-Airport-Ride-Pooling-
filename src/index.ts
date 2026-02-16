import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rideRoutes from './modules/ride/ride.routes';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Global Rate Limiter
app.use(apiLimiter);

// Routes
app.use('/ride', rideRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Smart Airport Ride Pooling API is running');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
