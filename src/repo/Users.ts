import { User } from '../types';
import { BaseRepository } from './BaseRepository';

export class Users extends BaseRepository<User> {
  constructor(bucket: R2Bucket) {
    super(bucket, 'users');
  }

  protected getItemKey(user: User): string {
    return user.email;
  }
}
