import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  IdCard,
  Stethoscope,
  Shield,
  ArrowRight,
  Droplet,
} from "lucide-react";
import { calculateAge, formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type UserData = Patient | Doctor;

interface Props {
  userData: UserData;
  userType: "patient" | "doctor";
}

// Type guards
const isDoctor = (user: UserData): user is Doctor => {
  return "matricula" in user;
};

const UserInformation: React.FC<Props> = ({ userData, userType }) => {
  // Obtener las iniciales del usuario
  const initials = `${userData.firstName?.[0] || ""}${
    userData.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Hero Background con Gradiente */}
        <div className="relative bg-gradient-to-r from-greenPrimary to-teal-600 p-8 pb-20">
          {/* Decorative Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>

        {/* Card Principal Elevada */}
        <div className="relative px-8 -mt-12 pb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar con Gradiente */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0">
                <span className="text-3xl font-bold text-white">
                  {initials}
                </span>
              </div>

              {/* Información del Usuario */}
              <div className="flex-1 min-w-0">
                {/* Nombre */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {userData.firstName} {userData.lastName}
                </h1>

                {/* Información Específica */}
                <div className="space-y-3">
                  {userType === "patient" && (() => {
                    const patient = userData as Patient;
                    return (
                      <>
                        {/* DNI */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <IdCard className="h-5 w-5 text-greenPrimary" />
                          <span className="font-medium">
                            {formatDni(patient.dni)}
                          </span>
                        </div>

                        {/* Badges de Género, Edad y Tipo de Sangre */}
                        <div className="flex gap-2 flex-wrap">
                          {patient.gender && (
                            <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                              {patient.gender}
                            </Badge>
                          )}
                          <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                            {calculateAge(String(patient.birthDate))} años
                          </Badge>
                          {patient.bloodType && patient.rhFactor &&
                            patient.bloodType !== 'null' && patient.rhFactor !== 'null' && (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <Droplet className="h-3 w-3 mr-1" />
                              {patient.bloodType} {patient.rhFactor}
                            </Badge>
                          )}
                        </div>

                        {/* Obra Social */}
                        {(patient.healthPlans?.[0]?.healthInsurance ||
                          patient.affiliationNumber) && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {patient.healthPlans?.[0]?.healthInsurance
                                  ?.name || "Obra Social No Asignada"}
                              </p>
                              {patient.affiliationNumber && (
                                <p className="text-sm text-gray-600">
                                  N° Afiliado: {patient.affiliationNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {userType === "doctor" && isDoctor(userData) && (
                    <>
                      {/* Matrícula */}
                      <div className="flex items-center gap-2 text-gray-700">
                        <Stethoscope className="h-5 w-5 text-greenPrimary" />
                        <span className="font-medium">
                          Matrícula: {userData.matricula}
                        </span>
                      </div>

                      {/* Especialidades */}
                      {userData.specialities &&
                        userData.specialities.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {userData.specialities.map((speciality, index) => (
                              <Badge
                                key={index}
                                className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20"
                              >
                                <Stethoscope className="h-3 w-3 mr-1" />
                                {typeof speciality === "string"
                                  ? speciality
                                  : speciality.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                      {/* Obras Sociales */}
                      {userData.healthInsurances &&
                        userData.healthInsurances.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              Obras Sociales Aceptadas:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {userData.healthInsurances.map(
                                (insurance, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-white border-blue-200"
                                  >
                                    {insurance.name}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>

              {/* Contacto y Acciones */}
              <div className="flex flex-col gap-4 md:w-64">
                {/* Información de Contacto */}
                <div className="space-y-3">
                  {/* Teléfono */}
                  <a
                    href={`tel:${userData.phoneNumber}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-greenPrimary/50 transition-all"
                  >
                    <Phone className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {userData.phoneNumber}
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${userData.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-greenPrimary/50 transition-all"
                  >
                    <Mail className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {userData.email}
                    </span>
                  </a>
                </div>

                {/* Botón Ver Perfil */}
                <Link
                  to={`/${userType === "patient" ? "pacientes" : "medicos"}/${
                    userData.slug
                  }/perfil`}
                  className="w-full"
                >
                  <Button className="w-full bg-greenPrimary hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all">
                    Ver perfil completo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default UserInformation;
