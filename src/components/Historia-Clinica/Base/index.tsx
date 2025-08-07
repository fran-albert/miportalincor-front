import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistoryContext } from "@/contexts/HistoryContext";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import AntecedentesSection from "@/components/Antecedentes/Section";
import EvolutionSection from "@/components/Evoluciones/Section";
import { Patient } from "@/types/Patient/Patient";

export default function HistoryBase() {
  const { userData, userType, antecedentes, evoluciones, permissions, config } =
    useHistoryContext();

  // Solo mostrar información del paciente si es un paciente
  const shouldShowPatientInfo =
    userType === "patient" || (userType === "doctor" && userData);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Información del Usuario */}
        {shouldShowPatientInfo && (
          <PatientInformation patient={userData as Patient} />
        )}

        {/* Sección de Antecedentes y Evoluciones */}
        <div
          className={`grid grid-cols-1 ${
            config.compactView ? "lg:grid-cols-2" : "lg:grid-cols-3"
          } gap-6`}
        >
          <AntecedentesSection
            userData={userData}
            userType={userType}
            antecedentes={antecedentes}
            readOnly={permissions.readOnlyMode}
            showEditActions={config.showEditActions}
          />

          {/* Evoluciones */}
          <EvolutionSection
            userData={userData}
            userType={userType}
            evoluciones={evoluciones}
            readOnly={permissions.readOnlyMode}
            showEditActions={config.showEditActions}
            allowNewEvolutions={config.allowNewEvolutions}
          />
        </div>

        {/* Medicación Actual - Solo si está configurado para mostrarse */}
        {config.showMedicationSection && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl">MEDICACIÓN ACTUAL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                  Lista de medicamentos actuales
                  {permissions.readOnlyMode && (
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                      Solo lectura
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              {/* Espacio vacío para mantener el layout */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
