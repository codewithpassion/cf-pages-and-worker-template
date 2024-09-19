import { Project } from '../types';
import { BaseRepository } from './BaseRepository';

export class Projects extends BaseRepository<Project> {
  constructor(bucket: R2Bucket) {
    super(bucket, 'projects');
  }

  protected getItemKey(project: Project): string {
    return project.name;
  }
}
