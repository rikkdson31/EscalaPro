import { PendingItemType, PendingItemPriority } from './pendingItem';

export enum ActionResolutionLevel {
  AUTO = 'AUTO',
  ASSISTED = 'ASSISTED',
  MANUAL = 'MANUAL',
  REVIEW = 'REVIEW'
}

export interface ActionButtonConfig {
  label: string;
  actionType: string;
}

export interface ActionStep {
  id: string;
  type: string;
  label: string;
}

export interface ActionBlueprint {
  id: string;
  pendingType: PendingItemType;
  title: string;
  description: string;
  icon: string;
  color: string;
  priority: PendingItemPriority;
  recommendedAction: string;
  primaryButton: ActionButtonConfig;
  secondaryButton?: ActionButtonConfig;
  requiresConfirmation: boolean;
  canAutoResolve: boolean;
  resolutionLevel: ActionResolutionLevel;
  suggestedData?: any;
  resolutionSteps: ActionStep[];
  successMessage: string;
  animation: string;
  healthImpact: number;
}
