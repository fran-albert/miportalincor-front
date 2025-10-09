import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, IdCard, Stethoscope } from "lucide-react";
import { calculateAge, formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type UserData = Patient | Doctor;

interface Props {
  userData: UserData;
  userType: "patient" | "doctor";
}

// Type guards
const isPatient = (user: UserData): user is Patient => {
  return "dni" in user && "cuil" in user;
};

const isDoctor = (user: UserData): user is Doctor => {
  return "matricula" in user;
};

const UserInformation: React.FC<Props> = ({ userData, userType }) => {
  // Obtener las iniciales del usuario
  const initials = `${userData.firstName?.[0] || ""}${
    userData.lastName?.[0] || ""
  }`.toUpperCase();

  const renderPatientInfo = (patient: Patient) => (
    <>
      <p className="text-gray-600 mt-1 flex items-center gap-2">
        <IdCard className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{formatDni(patient.dni)}</span>
      </p>
      <div className="flex gap-2 mt-3 flex-wrap">
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          {patient.gender}
        </Badge>
        <Badge variant="outline" className="text-gray-600 border-gray-300">
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
    </>
  );

  const renderDoctorInfo = (doctor: Doctor) => (
    <>
      <p className="text-gray-600 mt-1 flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-gray-400" />
        <span className="text-sm">Matrícula: {doctor.matricula}</span>
      </p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {doctor.specialities?.map((speciality, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-gray-600 border-gray-300"
          >
            {typeof speciality === 'object' && speciality.name ? speciality.name : String(speciality)}
          </Badge>
        ))}
      </div>
      {doctor.healthInsurances && doctor.healthInsurances.length > 0 && (
        <div className="mt-3">
          <span className="text-sm font-medium text-gray-700">
            Obras Sociales:{" "}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {doctor.healthInsurances.map((insurance, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs text-gray-600 border-gray-300"
              >
                {insurance.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderContactInfo = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{userData.phoneNumber}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Mail className="h-4 w-4 text-gray-400" />
        <span className="text-sm truncate">{userData.email}</span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sección principal - Información del usuario */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-semibold text-gray-700">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                {userData.firstName} {userData.lastName}
              </CardTitle>

              {isPatient(userData) && renderPatientInfo(userData)}
              {isDoctor(userData) && renderDoctorInfo(userData)}
            </div>
          </div>

          {/* Sección de contacto y acciones */}
          <div className="flex flex-col justify-between">
            {renderContactInfo()}
            <div className="mt-4 md:mt-0">
              <Link
                to={`/${userType === "patient" ? "pacientes" : "medicos"}/${
                  userData.slug
                }`}
              >
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

export default UserInformation;
