import { nanoid } from 'nanoid';
import { UsersRepo } from '../../src/repo/Users';
import { User } from '../../src/types';
import { R2Bucket } from '@cloudflare/workers-types';

// Mock R2Bucket
const mockR2Bucket = {
  get: jest.fn(),
  put: jest.fn(),
} as unknown as R2Bucket;

describe('Users Repository', () => {
  let usersRepo: UsersRepo;
  let otpMasterSecret: string;

  beforeEach(() => {
    otpMasterSecret = nanoid(5);
    usersRepo = new UsersRepo(mockR2Bucket, otpMasterSecret);
    jest.clearAllMocks();
  });

  test('create should add a new user', async () => {
    const mockData: User[] = [];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const newUser: User = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await usersRepo.create(newUser);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('users.json', JSON.stringify([newUser]));
  });

  test('read should return a user by id', async () => {
    const mockData: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user', isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const result = await usersRepo.read('2');
    expect(result).toEqual({ id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user', isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  test('update should modify an existing user', async () => {
    const mockData: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user', isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const updatedUser: User = { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user',  isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await usersRepo.update('2', updatedUser);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('users.json', JSON.stringify([
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user',  isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user',  isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]));
  });

  test('delete should remove a user', async () => {
    const mockData: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user',  isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user',  isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    await usersRepo.delete('1');

    expect(mockR2Bucket.put).toHaveBeenCalledWith('users.json', JSON.stringify([
      { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user',  isActivated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]));
  });
});
