import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { usePlanVersions } from "@/hooks/Program/usePlanVersions";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import { FrequencyPeriodLabels } from "@/types/Program/ProgramPlan";
import CreatePlanVersionDialog from "./CreatePlanVersionDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PlanTabProps {
  enrollmentId: string;
  activities: ProgramActivity[];
}

export default function PlanTab({ enrollmentId, activities }: PlanTabProps) {
  const { isAdmin, isDoctor } = useRoles();
  const { currentPlan, isLoading } = useCurrentPlan(enrollmentId);
  const { planVersions } = usePlanVersions(enrollmentId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const canCreate = isAdmin || isDoctor;

  if (isLoading) {
    return <div className="text-gray-500">Cargando plan...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plan Actual</h3>
        {canCreate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva Versión
          </Button>
        )}
      </div>

      {currentPlan ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Versión {currentPlan.version}
              </CardTitle>
              <Badge variant="outline">
                Desde{" "}
                {format(new Date(currentPlan.validFrom), "dd/MM/yyyy", {
                  locale: es,
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPlan.activities.map((pa) => (
                <div
                  key={pa.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{pa.activityName}</div>
                    {pa.notes && (
                      <div className="text-sm text-gray-500">{pa.notes}</div>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {pa.frequencyCount}x{" "}
                    {FrequencyPeriodLabels[pa.frequencyPeriod]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay un plan activo. Creá una nueva versión para comenzar.
          </CardContent>
        </Card>
      )}

      {planVersions.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">
            Versiones anteriores ({planVersions.length - 1})
          </h4>
          {planVersions
            .filter((v) => v.id !== currentPlan?.id)
            .map((version) => (
              <Card key={version.id} className="opacity-60">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Versión {version.version} — Desde{" "}
                      {format(
                        new Date(version.validFrom),
                        "dd/MM/yyyy",
                        { locale: es }
                      )}
                    </span>
                    {version.validTo && (
                      <span className="text-xs text-gray-400">
                        Hasta{" "}
                        {format(
                          new Date(version.validTo),
                          "dd/MM/yyyy",
                          { locale: es }
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <CreatePlanVersionDialog
        enrollmentId={enrollmentId}
        activities={activities}
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
      />
    </div>
  );
}
