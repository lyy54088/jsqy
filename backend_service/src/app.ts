import express from 'express';
import cors from 'cors';
import visionRoutes from './routes/vision';
import communityRoutes from './routes/community';
import chatRoutes from './routes/chat';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vision', visionRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

export default app;