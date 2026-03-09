export type PillarType = 'MODERN_MINISTRY' | 'HUMAN_ANCHOR' | 'LEAPFROG_INITIATIVE' | 'SOTHIC_GATEKEEPER';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  tags: string[];
  pillarType?: PillarType;
  relatedNoteIds: string[];
}

export interface PillarDefinition {
  id: PillarType;
  name: string;
  description: string;
  tone: string;
  color: string;
  icon: string;
}
