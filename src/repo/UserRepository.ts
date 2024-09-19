import { User } from '../types';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor(bucket: R2Bucket) {
    super(bucket, 'user');
  }

  protected getItemKey(user: User): string {
    return user.email;
  }
}
