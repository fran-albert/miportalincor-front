import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  IdCard,
  Droplet,
  ArrowRight,
  Shield,
} from "lucide-react";
import { calculateAge, formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  patient: Patient;
}

const PatientInformation: React.FC<Props> = ({ patient }) => {
  const initials = `${patient.firstName?.[0] || ""}${
    patient.lastName?.[0] || ""
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

              {/* Información del Paciente */}
              <div className="flex-1 min-w-0">
                {/* Nombre */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {patient.firstName} {patient.lastName}
                </h1>

                {/* Información Específica */}
                <div className="space-y-3">
                  {/* DNI */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <IdCard className="h-5 w-5 text-greenPrimary" />
                    <span className="font-medium">
                      {formatDni(patient.dni)}
                    </span>
                  </div>

                  {/* Badges de Género, Edad y Tipo de Sangre */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                      {patient.gender}
                    </Badge>
                    <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                      {calculateAge(String(patient.birthDate))} años
                    </Badge>
                    {patient.bloodType && patient.rhFactor && (
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
                          {patient.healthPlans?.[0]?.healthInsurance.name ||
                            "Sin Obra Social"}
                        </p>
                        {patient.affiliationNumber && (
                          <p className="text-sm text-gray-600">
                            N° Afiliado: {patient.affiliationNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacto y Acciones */}
              <div className="flex flex-col gap-4 md:w-64">
                {/* Información de Contacto */}
                <div className="space-y-3">
                  {/* Teléfono */}
                  <a
                    href={`tel:${patient.phoneNumber}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-greenPrimary/50 transition-all"
                  >
                    <Phone className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {patient.phoneNumber}
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${patient.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-00 hover:border-greenPrimary/50 transition-all"
                  >
                    <Mail className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {patient.email}
                    </span>
                  </a>

                  {/* Dirección */}
                  {patient?.address?.city?.state?.name &&
                    patient?.address?.city?.name && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">
                          {patient.address.city.state.name},{" "}
                          {patient.address.city.name}
                        </span>
                      </div>
                    )}
                </div>

                {/* Botón Ver Perfil */}
                <Link
                  to={`/pacientes/${patient?.slug}/perfil`}
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

export default PatientInformation;
