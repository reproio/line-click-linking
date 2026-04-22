import { Redis } from '@upstash/redis';
import { User, LineLink } from './types';

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

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return Array.from(this.store.keys()).filter(key => regex.test(key));
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

// LINE連携関連の操作
export const lineLinkDb = {
  async create(link: LineLink): Promise<void> {
    await store.set(`link:user:${link.userId}`, link);
    await store.set(`link:line:${link.lineUserId}`, link);
  },

  async findByUserId(userId: string): Promise<LineLink | null> {
    return await store.get<LineLink>(`link:user:${userId}`);
  },

  async findByLineUserId(lineUserId: string): Promise<LineLink | null> {
    return await store.get<LineLink>(`link:line:${lineUserId}`);
  },

  async delete(userId: string, lineUserId: string): Promise<void> {
    await store.del(`link:user:${userId}`);
    await store.del(`link:line:${lineUserId}`);
  },
};

// nonce関連の操作（アカウント連携フロー用）
// Upstash Redisの場合はTTL(10分)付きで保存、MemoryStoreの場合はTTLなし
export const nonceDb = {
  async create(nonce: string, serviceUserId: string): Promise<void> {
    if (isRedisAvailable) {
      // Upstash RedisのsetはTTLオプションをサポート
      await (store as Redis).set(`nonce:${nonce}`, serviceUserId, { ex: 600 });
    } else {
      await (store as MemoryStore).set(`nonce:${nonce}`, serviceUserId);
    }
  },

  // nonceを使ってserviceUserIdを取得し、同時に削除する（1回限り使用）
  async findAndDelete(nonce: string): Promise<string | null> {
    const userId = await store.get<string>(`nonce:${nonce}`);
    if (userId) {
      await store.del(`nonce:${nonce}`);
    }
    return userId;
  },
};
