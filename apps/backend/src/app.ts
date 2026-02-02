import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/environment';
import { errorHandler } from './common/middleware/error.middleware';
import { tenantMiddleware } from './common/middleware/tenant.middleware';
import routes from './routes';

const app: Express = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(tenantMiddleware);

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Static Files (Frontend)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../../public');
  app.use(express.static(publicPath));
  
  // Routes
  app.use(config.apiPrefix, routes);

  // SPA Fallback - must be after API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Routes
  app.use(config.apiPrefix, routes);
}

// Global Error Handler
app.use(errorHandler);

export default app;
