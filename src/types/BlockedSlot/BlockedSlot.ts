// ============================================
// ENUMS
// ============================================

export enum BlockReason {
  PERSONAL = 'PERSONAL',
  MEETING = 'MEETING',
  EMERGENCY = 'EMERGENCY',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

export const BlockReasonLabels: Record<BlockReason, string> = {
  [BlockReason.PERSONAL]: 'Personal',
  [BlockReason.MEETING]: 'Reunión',
  [BlockReason.EMERGENCY]: 'Emergencia',
  [BlockReason.MAINTENANCE]: 'Mantenimiento',
  [BlockReason.OTHER]: 'Otro',
};

export const BlockReasonColors: Record<BlockReason, string> = {
  [BlockReason.PERSONAL]: 'bg-blue-100 text-blue-800',
  [BlockReason.MEETING]: 'bg-purple-100 text-purple-800',
  [BlockReason.EMERGENCY]: 'bg-red-100 text-red-800',
  [BlockReason.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
  [BlockReason.OTHER]: 'bg-gray-100 text-gray-800',
};

// ============================================
// RESPONSE DTOs
// ============================================

export interface BlockedSlotResponseDto {
  id: number;
  doctorId: number;
  date: string;
  hour: string;
  reason: BlockReason;
  notes?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CREATE/UPDATE DTOs
// ============================================

export interface CreateBlockedSlotDto {
  doctorId: number;
  date: string;
  hour: string;
  reason: BlockReason;
  notes?: string;
}
