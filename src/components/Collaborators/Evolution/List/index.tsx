import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Evolution } from "@/types/Evolution/Evolution";
import { formatDateOnly, formatDoctorName } from "@/common/helpers/helpers";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import DeleteEvolutionDialog from "../Delete";
import { Label } from "@/components/ui/label";

interface Props {
  setEvolutionView: React.Dispatch<
    React.SetStateAction<"menu" | "list" | "new">
  >;
  evolutions: Evolution[];
  isLoadingEvolutions?: boolean;
}

const DoctorInfo: React.FC<{ doctorId: string }> = ({ doctorId }) => {
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
          {formatDoctorName(doctor)}
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
    return dataValue?.value != null ? String(dataValue.value) : "-";
  };

  const isLoading = isLoadingEvolutions;

  return (
    <div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Evoluciones del Colaborador</h3>
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
        ) : evolutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay evoluciones registradas
            </h3>
            <p className="text-muted-foreground mb-4">
              Este colaborador aún no tiene evoluciones médicas registradas.
            </p>
            <Button
              onClick={() => setEvolutionView("new")}
              className="bg-greenPrimary hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Evolución
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {evolutions.map((evolution) => (
              <Card key={evolution.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm text-muted-foreground">
                    Evolución #{evolution.medicalEvaluation.id}
                  </div>
                  <DeleteEvolutionDialog id={evolution.medicalEvaluation.id} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Fecha de Diagnóstico
                      </Label>
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
                      doctorId={String(evolution.medicalEvaluation.doctorId)}
                    />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Motivo de Consulta
                      </Label>
                      <p className="text-sm">
                        {getValueByDataTypeName(
                          evolution,
                          "Motivo de consulta"
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Enfermedad Actual
                      </Label>
                      <p className="text-sm mt-1">
                        {getValueByDataTypeName(evolution, "Enfermedad actual")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Notas a la Empresa
                    </Label>
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
