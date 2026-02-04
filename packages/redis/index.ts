import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a new Redis client instance
const createRedisClient = (clientName: string) => {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });

  client.on('connect', () => {
    console.log(`Redis ${clientName} connected successfully`);
  });

  client.on('error', (err) => {
    console.error(`Redis ${clientName} connection error:`, err);
  });

  return client;
};

// For backward compatibility and general use
export const createRedisConnection = () => {
  return createRedisClient('client');
};

// Create a dedicated publisher client
export const createPublisher = () => {
  return createRedisClient('publisher');
};

// Create a dedicated subscriber client
export const createSubscriber = () => {
  return createRedisClient('subscriber');
};