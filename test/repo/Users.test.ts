import { Users } from '../../src/repo/Users';
import { User } from '../../src/types';
import { R2Bucket } from '@cloudflare/workers-types';

// Mock R2Bucket
const mockR2Bucket = {
  get: jest.fn(),
  put: jest.fn(),
} as unknown as R2Bucket;

describe('Users Repository', () => {
  let usersRepo: Users;

  beforeEach(() => {
    usersRepo = new Users(mockR2Bucket);
    jest.clearAllMocks();
  });

  test('create should add a new user', async () => {
    const mockData: User[] = [];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const newUser: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
    await usersRepo.create(newUser);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('users.json', JSON.stringify([newUser]));
  });

  test('read should return a user by id', async () => {
    const mockData: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const result = await usersRepo.read('2');
    expect(result).toEqual({ id: '2', name: 'Jane Doe', email: 'jane@example.com' });
  });

  test('update should modify an existing user', async () => {
    const mockData: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const updatedUser: User = { id: '2', name: 'Jane Smith', email: 'jane@example.com' };
    await usersRepo.update('2', updatedUser);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('users.json', JSON.stringify([
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ]));
  });

  test('delete should remove a user', async () => {
    const mockData: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    await usersRepo.delete('1');

    expect(mockR2Bucket.put).toHaveBeenCalledWith('users.json', JSON.stringify([
      { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
    ]));
  });
});
