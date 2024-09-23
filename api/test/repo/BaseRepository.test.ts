import { BaseRepository } from '../../src/repo/BaseRepository';
import { R2Bucket } from '@cloudflare/workers-types';

// Mock R2Bucket
const mockR2Bucket = {
  get: jest.fn(),
  put: jest.fn(),
} as unknown as R2Bucket;

interface TestItem {
  id: string;
  name: string;
}

class TestRepository extends BaseRepository<TestItem> {
  constructor(bucket: R2Bucket) {
    super('test.json', bucket);
  }
}

describe('BaseRepository', () => {
  let repo: TestRepository;

  beforeEach(() => {
    repo = new TestRepository(mockR2Bucket);
    jest.clearAllMocks();
  });

  test('list should return all items', async () => {
    const mockData = [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const result = await repo.list();
    expect(result).toEqual(mockData);
    expect(mockR2Bucket.get).toHaveBeenCalledWith('test.json');
  });

  test('create should add a new item', async () => {
    const mockData: TestItem[] = [];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const newItem: TestItem = { id: '1', name: 'New Test' };
    await repo.create(newItem);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('test.json', JSON.stringify([newItem]));
  });

  test('read should return an item by id', async () => {
    const mockData = [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const result = await repo.read('2');
    expect(result).toEqual({ id: '2', name: 'Test 2' });
  });

  test('update should modify an existing item', async () => {
    const mockData = [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const updatedItem = { id: '2', name: 'Updated Test 2' };
    await repo.update('2', updatedItem);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('test.json', JSON.stringify([
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Updated Test 2' }
    ]));
  });

  test('delete should remove an item', async () => {
    const mockData = [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    await repo.delete('1');

    expect(mockR2Bucket.put).toHaveBeenCalledWith('test.json', JSON.stringify([
      { id: '2', name: 'Test 2' }
    ]));
  });

  test('create_update should create a new item if it doesn\'t exist', async () => {
    const mockData: TestItem[] = [];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const newItem: TestItem = { id: '1', name: 'New Test' };
    await repo.create_update(newItem);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('test.json', JSON.stringify([newItem]));
  });

  test('create_update should update an existing item', async () => {
    const mockData = [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const updatedItem: TestItem = { id: '2', name: 'Updated Test 2' };
    await repo.create_update(updatedItem);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('test.json', JSON.stringify([
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Updated Test 2' }
    ]));
  });
});
