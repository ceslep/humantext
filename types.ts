export enum RewriteTone {
  ACADEMIC = 'ACADEMIC',
  FORMAL = 'FORMAL',
}

export interface ProcessingStats {
  originalWords: number;
  newWords: number;
  processingTimeMs: number;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}