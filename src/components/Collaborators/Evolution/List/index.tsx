import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Evolution } from "@/types/Evolution/Evolution";
import { formatDateOnly } from "@/common/helpers/helpers";
import { useDoctor } from "@/hooks/Doctor/useDoctor";

interface Props {
  setEvolutionView: React.Dispatch<
    React.SetStateAction<"menu" | "list" | "new">
  >;
  evolutions: Evolution[];
  isLoadingEvolutions?: boolean;
}

const DoctorInfo: React.FC<{ doctorId: number }> = ({ doctorId }) => {
  const { doctor } = useDoctor({
    auth: true,
    id: doctorId,
  });

  if (!doctor) {
    return (
      <>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Médico
          </label>
          <p className="text-sm">-</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Especialidad
          </label>
          <p className="text-sm">-</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          Médico
        </label>
        <p className="text-sm">
          Dr. {doctor.firstName} {doctor.lastName}
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          Especialidad
        </label>
        <p className="text-sm">
          {doctor.specialities.map((spec, index) => (
            <span key={spec.id}>
              {spec.name}
              {index < doctor.specialities.length - 1 ? ", " : ""}
            </span>
          )) || "-"}
        </p>
      </div>
    </>
  );
};

const CollaboratorListEvolution: React.FC<Props> = ({
  setEvolutionView,
  evolutions,
  isLoadingEvolutions = false,
}) => {
  const getValueByDataTypeName = (
    evolution: Evolution,
    dataTypeName: string
  ): string => {
    const dataValue = evolution.medicalEvaluation.dataValues?.find(
      (dv) => dv.dataType.name === dataTypeName
    );
    return dataValue?.value || "-";
  };

  const uniqueDoctorIds = [
    ...new Set(
      evolutions.map((evolution) => evolution.medicalEvaluation.doctorId)
    ),
  ];

  const doctorQueries = uniqueDoctorIds.map((doctorId) =>
    useDoctor({ auth: true, id: doctorId })
  );

  const isLoadingDoctors = doctorQueries.some((query) => query.isLoading);

  const isLoading = isLoadingEvolutions || isLoadingDoctors;

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Evoluciones del Empleado</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEvolutionView("new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evolución
            </Button>
            <Button variant="ghost" onClick={() => setEvolutionView("menu")}>
              Volver
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {evolutions.map((evolution) => (
              <Card key={evolution.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Fecha de Diagnóstico
                      </label>
                      <p className="text-sm">
                        {(() => {
                          const fecha = getValueByDataTypeName(
                            evolution,
                            "Fecha de diagnóstico"
                          );
                          return fecha && fecha !== "-"
                            ? formatDateOnly(fecha)
                            : "-";
                        })()}
                      </p>
                    </div>
                    <DoctorInfo
                      doctorId={evolution.medicalEvaluation.doctorId}
                    />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Motivo de Consulta
                      </label>
                      <p className="text-sm">
                        {getValueByDataTypeName(
                          evolution,
                          "Motivo de consulta"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Enfermedad Actual
                      </label>
                      <p className="text-sm mt-1">
                        {getValueByDataTypeName(evolution, "Enfermedad actual")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Notas a la Empresa
                    </label>
                    <p className="text-sm mt-1">
                      {getValueByDataTypeName(evolution, "Notas a la empresa")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator className="my-6" />
      </div>
    </div>
  );
};

export default CollaboratorListEvolution;
