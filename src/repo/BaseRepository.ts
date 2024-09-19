import { HonoAppType } from '../types';

export abstract class BaseRepository<T> {
  protected bucket: R2Bucket;

  constructor(c: HonoAppType['Bindings']) {
    this.bucket = c.MY_BUCKET;
  }

  protected abstract getKey(item: T): string;

  async create(item: T): Promise<void> {
    const key = this.getKey(item);
    await this.bucket.put(key, JSON.stringify(item));
  }

  async read(key: string): Promise<T | null> {
    const object = await this.bucket.get(key);
    if (!object) return null;
    const data = await object.json();
    return data as T;
  }

  async update(item: T): Promise<void> {
    const key = this.getKey(item);
    await this.bucket.put(key, JSON.stringify(item));
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async list(): Promise<T[]> {
    const list = await this.bucket.list();
    const items: T[] = [];
    for (const object of list.objects) {
      const item = await this.read(object.key);
      if (item) items.push(item);
    }
    return items;
  }
}
