import { Hono } from 'hono';
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod';

import userRoutes from './routes/user.routes';
import { errorHandlerMiddleware } from './middleware/error.middleware';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Hello World!' });
});

app.route('api', userRoutes)

app.onError((err, c) => {
  console.log('Error caught in middleware:', err);
  
  if (err instanceof HTTPException) {
    return c.json(err.getResponse(), err.status);
    // throw new HTTPException(400, { message: 'Custom error message' })
  } else if (err instanceof ZodError) {
    throw new HTTPException(422, { message: 'Validation failed' })
  }

  return c.json({ message: 'Internal server error' }, 500);
})

// app.get('/env', (c) => {
//   const { PORT } = env<{ PORT: string }>(c)
//   return c.text(PORT)
// })


export default { 
  port: 3000,
  fetch: app.fetch
}