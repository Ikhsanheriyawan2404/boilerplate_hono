import { Context, Hono } from 'hono';
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod';
// import userRoutes from './routes/user.routes';
import { fileLogger } from './middleware/logger.middleware';
import { logError } from './logger';
import redisClient from './database/redis';

const app = new Hono();

app.get('/test-redis', async (c: Context) => {
  await redisClient.set('test-key', 'Test Value');
  const value = await redisClient.get('test-key');

  return c.json({ message: 'Redis connection test successful', value });
});

app.get('/', (c) => c.text('Halo Sayang'));

app.use(fileLogger)
app.use(logger())

// app.route('api', userRoutes)

app.notFound((c) => {
  const { method, url } = c.req;
  const status = 404
  const body = {
    message: "Not found"
  };

  logError({ method, url, status, responseBody: body });
  c.status(404)
  return c.json(body)
})

app.onError((err, c) => {
  const { method, url } = c.req;

  if (err instanceof HTTPException) {
    console.log('httpesception')
    const status = err.status
    const responseBody = err.getResponse()
    logError({ method, url, status, responseBody });
    return c.json(err.getResponse(), err.status);
  } else if (err instanceof ZodError) {
    console.log('xzod')
    const validationErrors = err.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message,
    }));
    const status = 422
    const responseBody = validationErrors
    logError({ method, url, status, responseBody })
    return c.json({
      message: 'Validation Error',
      validationErrors,
    }, 422);
  } else {
    console.log('500 err')
    const status = 500
    const responseBody = err.stack
    logError({ method, url, status, responseBody });
    return c.json({ message: 'Internal server error' }, 500);
  }
})

export default {
  port: process.env.PORT,
  fetch: app.fetch
}
