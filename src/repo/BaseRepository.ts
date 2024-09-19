
export abstract class BaseRepository<T> {
  protected bucket: R2Bucket;
  protected objectKey: string;

  constructor(bucket: R2Bucket, objectKey: string) {
    this.bucket = bucket;
    this.objectKey = objectKey;
  }

  protected abstract getItemKey(item: T): string;

  async create(item: T): Promise<void> {
    const key = `${this.objectKey}:${this.getItemKey(item)}`;
    await this.bucket.put(key, JSON.stringify(item));
  }

  async read(itemKey: string): Promise<T | null> {
    const key = `${this.objectKey}:${itemKey}`;
    const object = await this.bucket.get(key);
    if (!object) return null;
    const data = await object.json();
    return data as T;
  }

  async update(item: T): Promise<void> {
    const key = `${this.objectKey}:${this.getItemKey(item)}`;
    await this.bucket.put(key, JSON.stringify(item));
  }

  async delete(itemKey: string): Promise<void> {
    const key = `${this.objectKey}:${itemKey}`;
    await this.bucket.delete(key);
  }

  async list(): Promise<T[]> {
    const list = await this.bucket.list({ prefix: `${this.objectKey}:` });
    const items: T[] = [];
    for (const object of list.objects) {
      const item = await this.read(object.key.split(':')[1]);
      if (item) items.push(item);
    }
    return items;
  }
}
