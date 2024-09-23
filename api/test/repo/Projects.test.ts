import { Projects } from '../../src/repo/Projects';
import { Project, User } from '../../src/types';
import { R2Bucket } from '@cloudflare/workers-types';

// Mock R2Bucket
const mockR2Bucket = {
  get: jest.fn(),
  put: jest.fn(),
} as unknown as R2Bucket;

describe('Projects Repository', () => {
  let projectsRepo: Projects;

  beforeEach(() => {
    projectsRepo = new Projects(mockR2Bucket);
    jest.clearAllMocks();
  });

  const mockUser: User = { id: '1', name: 'John Doe', email: 'john@example.com' };

  test('create should add a new project', async () => {
    const mockData: Project[] = [];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const newProject: Project = { 
      id: '1', 
      name: 'Test Project', 
      description: 'A test project',
      admins: [mockUser],
      members: []
    };
    await projectsRepo.create(newProject);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('projects.json', JSON.stringify([newProject]));
  });

  test('read should return a project by id', async () => {
    const mockData: Project[] = [
      { id: '1', name: 'Project 1', description: 'First project', admins: [mockUser], members: [] },
      { id: '2', name: 'Project 2', description: 'Second project', admins: [mockUser], members: [] }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const result = await projectsRepo.read('2');
    expect(result).toEqual({ id: '2', name: 'Project 2', description: 'Second project', admins: [mockUser], members: [] });
  });

  test('update should modify an existing project', async () => {
    const mockData: Project[] = [
      { id: '1', name: 'Project 1', description: 'First project', admins: [mockUser], members: [] },
      { id: '2', name: 'Project 2', description: 'Second project', admins: [mockUser], members: [] }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    const updatedProject: Project = { 
      id: '2', 
      name: 'Updated Project 2', 
      description: 'Updated second project',
      admins: [mockUser],
      members: [mockUser]
    };
    await projectsRepo.update('2', updatedProject);

    expect(mockR2Bucket.put).toHaveBeenCalledWith('projects.json', JSON.stringify([
      { id: '1', name: 'Project 1', description: 'First project', admins: [mockUser], members: [] },
      updatedProject
    ]));
  });

  test('delete should remove a project', async () => {
    const mockData: Project[] = [
      { id: '1', name: 'Project 1', description: 'First project', admins: [mockUser], members: [] },
      { id: '2', name: 'Project 2', description: 'Second project', admins: [mockUser], members: [] }
    ];
    mockR2Bucket.get.mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockData)),
    });

    await projectsRepo.delete('1');

    expect(mockR2Bucket.put).toHaveBeenCalledWith('projects.json', JSON.stringify([
      { id: '2', name: 'Project 2', description: 'Second project', admins: [mockUser], members: [] }
    ]));
  });
});
