export enum WorkflowState {
  NOT_STARTED = 'NOT_STARTED',
  WORKING = 'WORKING',
  BREAK = 'BREAK',
  RETURNED = 'RETURNED',
  FINISHED = 'FINISHED',
  INCOMPLETE = 'INCOMPLETE',
  INVALID_SEQUENCE = 'INVALID_SEQUENCE',
  JUSTIFICATION_REQUIRED = 'JUSTIFICATION_REQUIRED'
}

export enum WorkflowAction {
  ENTRY = 'ENTRY',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END',
  EXIT = 'EXIT',
  NONE = 'NONE'
}

export interface WorkflowStatus {
  currentState: WorkflowState;
  nextAction: WorkflowAction;
  label: string;
  description: string;
  completed: boolean;
  requiresAttention: boolean;
  progress: number;
}
