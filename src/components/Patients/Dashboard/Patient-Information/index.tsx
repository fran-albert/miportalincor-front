import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, IdCard } from "lucide-react";
import { calculateAge, formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  patient: Patient;
}

const PatientInformation: React.FC<Props> = ({ patient }) => {
  // Obtener las iniciales del paciente
  const initials = `${patient.firstName?.[0] || ""}${
    patient.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sección principal - Información del paciente */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-semibold text-gray-700">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                {patient.firstName} {patient.lastName}
              </CardTitle>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <IdCard className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formatDni(patient.dni)}</span>
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-300"
                >
                  {patient.gender}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-300"
                >
                  {calculateAge(String(patient.birthDate))} años
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">
                    {patient?.healthPlans?.[0]?.healthInsurance.name ??
                      "Obra Social No Asignada"}
                  </span>
                  {patient?.affiliationNumber && (
                    <span className="text-gray-500">
                      {" "}
                      • {patient.affiliationNumber}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sección de contacto y acciones */}
          <div className="flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{patient.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm truncate">{patient.email}</span>
              </div>
              {patient?.address?.city?.state?.name &&
                patient?.address?.city?.name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {patient.address.city.state.name},{" "}
                      {patient.address.city.name}
                    </span>
                  </div>
                )}
            </div>
            <div className="mt-4 md:mt-0">
              <Link to={`/pacientes/${patient?.slug}/perfil`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto hover:bg-gray-50"
                >
                  Ver perfil completo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default PatientInformation;
