import { Project } from '../types';
import { BaseRepository } from './BaseRepository';

export class ProjectRepository extends BaseRepository<Project> {
  constructor(bucket: R2Bucket) {
    super(bucket, 'project');
  }

  protected getItemKey(project: Project): string {
    return project.name;
  }
}
