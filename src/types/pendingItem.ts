export enum PendingItemType {
  MISSING_ENTRY = 'MISSING_ENTRY',
  MISSING_BREAK = 'MISSING_BREAK',
  MISSING_RETURN = 'MISSING_RETURN',
  MISSING_EXIT = 'MISSING_EXIT',
  INVALID_SEQUENCE = 'INVALID_SEQUENCE',
  DUPLICATED_RECORD = 'DUPLICATED_RECORD',
  JUSTIFICATION_REQUIRED = 'JUSTIFICATION_REQUIRED',
  MANUAL_REVIEW = 'MANUAL_REVIEW'
}

export enum PendingItemStatus {
  DETECTED = 'DETECTED',
  CREATED = 'CREATED',
  NOTIFIED = 'NOTIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  JUSTIFIED = 'JUSTIFIED',
  RESOLVED = 'RESOLVED',
  ARCHIVED = 'ARCHIVED'
}

export enum PendingItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface PendingItem {
  id: string;
  profileId: string;
  timeRecordId: string;
  createdAt: string;
  updatedAt: string;
  status: PendingItemStatus;
  priority: PendingItemPriority;
  type: PendingItemType;
  title: string;
  description: string;
  recommendation: string;
  dueDate?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}
