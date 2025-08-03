import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, IdCard } from "lucide-react";
import { calculateAge, formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  patient: Patient;
}

const PatientInformation: React.FC<Props> = ({ patient }) => {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#187B80" }}
            >
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {patient.firstName} {patient.lastName}
              </CardTitle>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <IdCard className="h-6 w-6" />
                <span className="flex items-center gap-1">
                  {formatDni(patient.dni)}
                </span>
              </p>
              <div className="flex gap-4 mt-2">
                <Badge variant="outline">{patient.gender}</Badge>
                <Badge variant="secondary">
                  {calculateAge(String(patient.birthDate))} años
                </Badge>
                {/* <Badge variant="secondary">Tipo {patient.bloodType}</Badge> */}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">
                    {patient?.healthPlans?.[0]?.healthInsurance.name ??
                      "Obra Social No Asignada"}{" "}
                    -{" "}
                    {patient?.affiliationNumber ??
                      "No tiene número de obra social asignado."}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {patient.phoneNumber}
            </p>
            <p className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {patient.email}
            </p>
            <p className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {patient?.address?.city?.state?.name &&
              patient?.address?.city?.name
                ? `${patient.address.city.state.name}, ${patient.address.city.name}`
                : ""}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-2 hover:bg-teal-50 text-teal-700 border-teal-200 bg-transparent"
              style={{ borderColor: "#187B80", color: "#0C484A" }}
            >
              <Link to={`/pacientes/${patient?.slug}/perfil`}>
                Ver perfil completo
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default PatientInformation;
