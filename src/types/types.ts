// types/types.ts
export type Role = 'user' | 'pd' | 'arch' | 'proj' | 'dev';

export type PromptType = 
  | 'user_confirm'
  | 'pd_confirm' | 'pd_edit' | 'pd_adjust'
  | 'arch_confirm' | 'arch_edit' | 'arch_adjust'
  | 'proj_confirm' | 'proj_edit' | 'proj_adjust'
  | 'dev_confirm' | 'dev_edit' | 'dev_adjust';

export type ActionType = 'confirm' | 'edit' | 'adjust' | 'generateDoc';

export interface MessageItem {
  id: string;
  role: Role;
  content: string;
  showActions: boolean;
  actions?: ActionType[];
}

export interface ProcessStage {
  currentRole: Role;
  editingId?: string;
  editMode: 'none' | 'manual' | 'llm';
}

export type WebSocketStage = 'prd' | 'design' | 'code' | 'review';

export interface TabState {
  messages: MessageItem[];
  currentStage: ProcessStage;
  uploadedFiles: Record<Role, File | null>;
}

export type TabType = 'create' | 'incremental';

export type SetStateAction<S> = S | ((prevState: S) => S);