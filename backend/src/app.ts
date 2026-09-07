import express from 'express';
import morgan from 'morgan';
import { corsMiddleware, helmetMiddleware, apiRateLimiter } from './middleware/security.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { env } from './config/env';
import routes from './routes';

const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (!env.isProduction) {
  app.use(morgan('dev'));
}

app.use('/api', apiRateLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
