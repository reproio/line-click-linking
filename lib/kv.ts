import { Redis } from '@upstash/redis';
import type { User } from './types';

// ローカル開発用のメモリストア
class MemoryStore {
  private store: Map<string, string> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Upstash Redisが利用可能かチェック
const isRedisAvailable = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
const store = isRedisAvailable
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : new MemoryStore();

// ユーザー関連の操作
export const userDb = {
  async create(user: User): Promise<void> {
    await store.set(`user:${user.userId}`, user);
    await store.set(`user:email:${user.email}`, user.userId);
  },

  async findById(userId: string): Promise<User | null> {
    return await store.get<User>(`user:${userId}`);
  },

  async findByEmail(email: string): Promise<User | null> {
    const userId = await store.get<string>(`user:email:${email}`);
    if (!userId) return null;
    return await store.get<User>(`user:${userId}`);
  },
};
