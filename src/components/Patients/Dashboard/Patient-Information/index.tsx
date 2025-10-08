import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, IdCard, User, Droplet } from "lucide-react";
import { calculateAge, formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  patient: Patient;
}

const PatientInformation: React.FC<Props> = ({ patient }) => {
  const initials = `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase();

  const getBadgeColor = (type: string) => {
    if (type === "Masculino") return "bg-blue-100 text-blue-700 border-blue-200";
    if (type === "Femenino") return "bg-pink-100 text-pink-700 border-pink-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Hero Background */}
        <div className="relative bg-gradient-to-r from-greenPrimary to-teal-600 p-8 pb-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        {/* Patient Info Card */}
        <div className="relative px-8 -mt-12 pb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center border-4 border-white shadow-xl">
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white" />
                </div>
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IdCard className="h-3 w-3" />
                      {formatDni(patient.dni)}
                    </Badge>
                    <Badge variant="outline" className={getBadgeColor(patient.gender)}>
                      <User className="h-3 w-3 mr-1" />
                      {patient.gender}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                      {calculateAge(String(patient.birthDate))} años
                    </Badge>
                    {patient.bloodType && patient.rhFactor && (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                        <Droplet className="h-3 w-3" />
                        {patient.bloodType} {patient.rhFactor}
                      </Badge>
                    )}
                  </div>

                  {/* Obra Social */}
                  <div className="inline-flex items-center gap-2 bg-greenPrimary/10 px-4 py-2 rounded-lg">
                    <span className="font-semibold text-greenPrimary">
                      {patient?.healthPlans?.[0]?.healthInsurance.name ?? "Sin Obra Social"}
                    </span>
                    {patient?.affiliationNumber && (
                      <span className="text-gray-600">• Nº {patient.affiliationNumber}</span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={`tel:${patient.phoneNumber}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-greenPrimary transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{patient.phoneNumber}</span>
                  </a>

                  <a
                    href={`mailto:${patient.email}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-greenPrimary transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium truncate">{patient.email}</span>
                  </a>

                  {patient?.address?.city?.state?.name && patient?.address?.city?.name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {patient.address.city.state.name}, {patient.address.city.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-between gap-3">
                <Link to={`/pacientes/${patient?.slug}/perfil`}>
                  <Button className="w-full bg-gradient-to-r from-greenPrimary to-teal-600 hover:from-greenPrimary hover:to-teal-700 text-white">
                    Ver Perfil Completo
                  </Button>
                </Link>
                {/* <Button variant="outline" className="w-full">
                  Agendar Cita
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PatientInformation;
