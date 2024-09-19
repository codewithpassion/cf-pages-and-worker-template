import { Project } from '../types';
import { BaseRepository } from './BaseRepository';

export class ProjectRepository extends BaseRepository<Project> {
  protected getKey(project: Project): string {
    return `project:${project.name}`;
  }
}
