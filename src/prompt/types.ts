export type Role = 'user' | 'pd' | 'arch' | 'dev';
export type ActionType = 'confirm' | 'edit' | 'adjust'| 'generateDoc';

export interface PromptTemplate {
  system: string;
  user: string;
}

export type PromptKey = `${Role}_${ActionType}`;