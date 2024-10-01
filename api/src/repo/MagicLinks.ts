import { MagicLinkToken, Project } from '../types';
import { BaseRepository } from './BaseRepository';

export class MagicLinksRepo extends BaseRepository<MagicLinkToken> {
  constructor(bucket: R2Bucket) {
    super('magicLinks.json', bucket);
  }

  protected override getItemKey(link: MagicLinkToken): string {
    return link.token;
  }
  override getDefaults(): MagicLinkToken[] {
    return [];
  }
}
