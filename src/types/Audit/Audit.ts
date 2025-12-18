export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SOFT_DELETE"
  | "READ_SENSITIVE"
  | "ACCESS_DENIED";

export interface AuditMetadata {
  ip: string | null;
  userAgent: string | null;
  endpoint: string | null;
  method: string | null;
  statusCode: number | null;
  executionTime: number | null;
}

export interface AuditLog {
  id: string;
  entityName: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  userEmail: string;
  userRoles: string[];
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  metadata: AuditMetadata;
  timestamp: string;
  module: string;
  createdAt: string;
}

export interface AuditQueryParams {
  entityName?: string;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  orderBy?: "timestamp" | "action";
  orderDirection?: "ASC" | "DESC";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAuditResponse {
  data: AuditLog[];
  meta: PaginationMeta;
}

export const AUDIT_ACTIONS: { value: AuditAction; label: string }[] = [
  { value: "CREATE", label: "Crear" },
  { value: "UPDATE", label: "Actualizar" },
  { value: "DELETE", label: "Eliminar" },
  { value: "SOFT_DELETE", label: "Eliminar (soft)" },
  { value: "READ_SENSITIVE", label: "Lectura sensible" },
  { value: "ACCESS_DENIED", label: "Acceso denegado" },
];

export const AUDIT_MODULES: { value: string; label: string }[] = [
  { value: "patient", label: "Pacientes" },
  { value: "doctor", label: "Médicos" },
  { value: "user", label: "Usuarios" },
  { value: "study", label: "Estudios" },
  { value: "blood-test-data", label: "Análisis de sangre" },
  { value: "nutrition-data", label: "Nutrición" },
  { value: "current-medication", label: "Medicación" },
  { value: "user-historia-clinica", label: "Historia clínica" },
  { value: "user-evolution", label: "Evoluciones" },
  { value: "data-value", label: "Datos clínicos" },
  { value: "prescription-request", label: "Recetas" },
];

export const getActionColor = (action: AuditAction): string => {
  const colors: Record<AuditAction, string> = {
    CREATE: "bg-green-100 text-green-800 border-green-200",
    UPDATE: "bg-blue-100 text-blue-800 border-blue-200",
    DELETE: "bg-red-100 text-red-800 border-red-200",
    SOFT_DELETE: "bg-orange-100 text-orange-800 border-orange-200",
    READ_SENSITIVE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ACCESS_DENIED: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[action] || "bg-gray-100 text-gray-800";
};

export const getActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    CREATE: "Crear",
    UPDATE: "Actualizar",
    DELETE: "Eliminar",
    SOFT_DELETE: "Soft Delete",
    READ_SENSITIVE: "Lectura",
    ACCESS_DENIED: "Denegado",
  };
  return labels[action] || action;
};
