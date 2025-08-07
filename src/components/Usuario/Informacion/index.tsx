import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, IdCard, Stethoscope } from "lucide-react";
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
  const renderPatientInfo = (patient: Patient) => (
    <>
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
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{patient.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{patient.email}</span>
        </div>
      </div>
    </>
  );

  const renderDoctorInfo = (doctor: Doctor) => (
    <>
      <p className="text-gray-600 mt-1 flex items-center gap-2">
        <Stethoscope className="h-6 w-6" />
        <span className="flex items-center gap-1">
          Matrícula: {doctor.matricula}
        </span>
      </p>
      <div className="flex gap-4 mt-2">
        {doctor.specialities?.map((speciality, index) => (
          <Badge key={index} variant="outline">
            {speciality.name || speciality}
          </Badge>
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{doctor.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{doctor.email}</span>
        </div>
      </div>
      {doctor.healthInsurances && doctor.healthInsurances.length > 0 && (
        <div className="mt-3">
          <span className="text-sm font-medium text-gray-700">
            Obras Sociales:{" "}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {doctor.healthInsurances.map((insurance, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {insurance.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#187B80" }}
            >
              {userType === "doctor" ? (
                <Stethoscope className="h-8 w-8 text-white" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {userData.firstName} {userData.lastName}
              </CardTitle>

              {isPatient(userData) && renderPatientInfo(userData)}
              {isDoctor(userData) && renderDoctorInfo(userData)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link
                to={`/${userType === "patient" ? "pacientes" : "medicos"}/${
                  userData.slug
                }`}
              >
                Ver Perfil
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default UserInformation;
