import { User } from '../types';
import { BaseRepository } from './BaseRepository';

export class UsersRepo extends BaseRepository<User> {
  constructor(bucket: R2Bucket) {
    super('users.json', bucket,);
  }

  async findByEamil(email: string): Promise<User | null> {
    const data = await this.list()
    return data.find(item => item.email === email) || null;
  }

  override getDefaults(): User[] {
    return [
      {
        id: 'dominik@portcity-ai.com',
        role: 'admin',
        isActivated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: 'Dom',
        email: 'dominik@portcity-ai.com'
      }
    ];
  }

  protected getItemKey(user: User): string {
    return user.email;
  }

}
