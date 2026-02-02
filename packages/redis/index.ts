import { Redis } from 'ioredis';

export const createRedisConnection = () => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(url, {
    maxRetriesPerRequest: null,
  });

  client.on('connect', () => {
    console.log('Redis connected successfully');
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return client;
};