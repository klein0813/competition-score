import { Cache } from 'cache-manager';

export default class CacheUtil {
  private static cacheManager: Cache;

  public static setManager(cacheManager: Cache) {
    this.cacheManager = cacheManager;
    this.get = this.cacheManager.get;
    this.del = this.cacheManager.del;
  }

  public static set(key: string, value: any, ttl?: number) {
    if (ttl === undefined) {
      return this.cacheManager.set(key, value);
    }
    return this.cacheManager.set(key, value, ttl);
  }

  public static async inc(key: string, init = 0): Promise<number> {
    let v: number = await this.get(key);
    if (v !== null) {
      this.set(key, v++);
    }
    v = init;
    this.set(key, v);

    return v;
  }

  public static get: (arg0: string) => any;

  public static del: (arg0: string) => void;
}
