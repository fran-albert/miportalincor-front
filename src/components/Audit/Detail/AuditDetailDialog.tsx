import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { AuditLog, AuditAction } from "@/types/Audit/Audit";
import { getActionColor, getActionLabel } from "@/types/Audit/Audit";
import { formatDateWithTime } from "@/common/helpers/helpers";

interface AuditDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditDetailDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalle de Auditoria
            <Badge className={getActionColor(log.action as AuditAction)}>
              {getActionLabel(log.action as AuditAction)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {log.entityName} - {formatDateWithTime(log.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Informacion general */}
            <section>
              <h4 className="text-sm font-semibold mb-3">Informacion General</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-mono text-xs break-all">{log.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Modulo:</span>
                  <p>
                    <Badge variant="outline">{log.module}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Entidad:</span>
                  <p className="font-medium">{log.entityName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Entidad:</span>
                  <p className="font-mono text-xs break-all">{log.entityId}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Usuario */}
            <section>
              <h4 className="text-sm font-semibold mb-3">Usuario</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID Usuario:</span>
                  <p>{log.userId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p>{log.userEmail}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Roles:</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {log.userRoles?.map((role, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Metadata */}
            <section>
              <h4 className="text-sm font-semibold mb-3">Metadata HTTP</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">IP:</span>
                  <p className="font-mono">{log.metadata?.ip || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Metodo:</span>
                  <p>
                    <Badge variant="outline">{log.metadata?.method || "-"}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Endpoint:</span>
                  <p className="font-mono text-xs">{log.metadata?.endpoint || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status Code:</span>
                  <p>{log.metadata?.statusCode || "-"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">User Agent:</span>
                  <p className="text-xs text-muted-foreground break-all">
                    {log.metadata?.userAgent || "-"}
                  </p>
                </div>
                {log.metadata?.executionTime && (
                  <div>
                    <span className="text-muted-foreground">Tiempo ejecucion:</span>
                    <p>{log.metadata.executionTime}ms</p>
                  </div>
                )}
              </div>
            </section>

            {/* Datos anteriores */}
            {log.previousData && Object.keys(log.previousData).length > 0 && (
              <>
                <Separator />
                <section>
                  <h4 className="text-sm font-semibold mb-3 text-orange-600">
                    Datos Anteriores
                  </h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-48">
                    {JSON.stringify(log.previousData, null, 2)}
                  </pre>
                </section>
              </>
            )}

            {/* Datos nuevos */}
            {log.newData && Object.keys(log.newData).length > 0 && (
              <>
                <Separator />
                <section>
                  <h4 className="text-sm font-semibold mb-3 text-green-600">
                    Datos Nuevos
                  </h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-48">
                    {JSON.stringify(log.newData, null, 2)}
                  </pre>
                </section>
              </>
            )}

            {/* Cambios */}
            {log.changes && Object.keys(log.changes).length > 0 && (
              <>
                <Separator />
                <section>
                  <h4 className="text-sm font-semibold mb-3 text-blue-600">
                    Cambios Detectados
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(log.changes).map(([field, change]) => (
                      <div
                        key={field}
                        className="bg-muted p-2 rounded-md text-sm"
                      >
                        <span className="font-medium">{field}:</span>
                        <div className="flex gap-2 mt-1 text-xs">
                          <span className="text-red-600 line-through">
                            {JSON.stringify(change.from)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-green-600">
                            {JSON.stringify(change.to)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
