import { Project } from '../types';
import { BaseRepository } from './BaseRepository';

export class Projects extends BaseRepository<Project> {
  constructor(bucket: R2Bucket) {
    super('projects.json', bucket);
  }

  protected override getItemKey(project: Project): string {
    return project.id;
  }
  override getDefaults(): Project[] {
    return [
      {
        id: 'auth',
        name: 'Auth',
        description: 'Authentication',
        admins: ['dominik@portcity-ai.com'],
        members: [],
        magicLinkValiditySeconds: 600,
        redirectUrl: 'https://heimdall.portcity-ai.com',
        authOptions: ['magic-link'],
      } as Project,
    ];
  }
}
