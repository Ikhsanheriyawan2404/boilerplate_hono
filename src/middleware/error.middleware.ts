import { Context } from 'hono';
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod';

export const errorHandlerMiddleware = createMiddleware(async (c: Context, next) => {
    try {
      await next();
    } catch (error) {

      if (error instanceof HTTPException) {
        throw new HTTPException(400, { message: 'Custom error message' })
      } else if (error instanceof ZodError) {
        throw new HTTPException(422, { message: 'Validation failed' })
      } else {
        // Handle other errors
        return c.json({ message: 'fsd' }, 500);
      }
  
    }
})

// gak berfungsi