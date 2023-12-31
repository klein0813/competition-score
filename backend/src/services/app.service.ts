import { Inject, Injectable } from '@nestjs/common';
import CacheUtil from 'src/utils/cache.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    CacheUtil.setManager(cacheManager);
  }
}
