import { R2Bucket } from '@cloudflare/workers-types';

export class BaseRepository<T extends { id: string }> {
  private key: string;
  private bucket: R2Bucket;

  constructor(key: string, bucket: R2Bucket) {
    this.key = key;
    this.bucket = bucket;
  }

  protected getDefaults(): T[] {
    return [];
  }

  private async getData(): Promise<T[]> {
    const object = await this.bucket.get(this.key);
    if (!object) return this.getDefaults();
    const text = await object.text();
    return JSON.parse(text);
  }

  private async saveData(data: T[]): Promise<void> {
    await this.bucket.put(this.key, JSON.stringify(data));
  }

  async list(): Promise<T[]> {
    return this.getData();
  }

  async create(item: T): Promise<T> {
    const data = await this.getData();
    data.push(item);
    await this.saveData(data);
    return item;
  }

  async read(id: string): Promise<T | null> {
    const data = await this.getData();
    return data.find(item => item.id === id) || null;
  }

  async update(id: string, updatedItem: Partial<T>): Promise<T | null> {
    const data = await this.getData();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updatedItem };
    await this.saveData(data);
    return data[index];
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.getData();
    const filteredData = data.filter(item => item.id !== id);
    if (filteredData.length === data.length) return false;

    await this.saveData(filteredData);
    return true;
  }

  async create_update(item: T): Promise<T> {
    const data = await this.getData();
    const index = data.findIndex(existingItem => existingItem.id === item.id);

    if (index === -1) {
      // Item doesn't exist, create new
      data.push(item);
    } else {
      // Item exists, update it
      data[index] = { ...data[index], ...item };
    }

    await this.saveData(data);
    return item;
  }
}

