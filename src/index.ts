import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod';
import userRoutes from './routes/user.routes';
import { fileLogger } from './middleware/logger.middleware';
import { logError } from './logger';

const app = new Hono();

app.get('/', (c) => c.text('Halo Sayang'));

// app.use(fileLogger)
// app.use(logger())

app.route('api', userRoutes)
app.get('api/access', (c) => {
  throw new HTTPException(401, { message: 'Custom error message' })
});

app.notFound((c) => {
  // logError({ method, url, status, responseBody });
  c.status(404)
  return c.json({
    message: "Not found",
  })
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
  port: 4000,
  fetch: app.fetch
}