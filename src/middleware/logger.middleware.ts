// logger.ts
import { MiddlewareHandler } from 'hono';
import { logInfo } from '../logger';

export const fileLogger: MiddlewareHandler = async (c, next) => {
  await next();
  
  const { method, url } = c.req;
  const { status } = c.res;

  if (status >= 200 && status <= 299) {
    logInfo({ method, url, status });
  }
};