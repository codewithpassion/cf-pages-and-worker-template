import { User } from '../types';
import { BaseRepository } from './BaseRepository';

export class Users extends BaseRepository<User> {
  constructor(bucket: R2Bucket) {
    super('users.json', bucket,);
  }

  protected getItemKey(user: User): string {
    return user.email;
  }
}
