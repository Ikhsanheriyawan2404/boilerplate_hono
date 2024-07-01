import Redis from 'ioredis';

const redisClient: Redis = new Redis({
    port: Number(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    db: Number(process.env.REDIS_DB) || 0,
});

export default redisClient;