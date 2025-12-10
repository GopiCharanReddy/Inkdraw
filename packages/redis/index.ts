import { Redis } from 'ioredis';

export const createRedisConnection = () => new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null
});