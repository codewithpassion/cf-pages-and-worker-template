import { User } from '../types';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  protected getKey(user: User): string {
    return `user:${user.email}`;
  }
}
