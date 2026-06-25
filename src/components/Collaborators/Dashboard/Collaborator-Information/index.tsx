import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  MapPin,
  IdCard,
  Briefcase,
  ArrowRight,
  Building2,
  Edit2,
} from "lucide-react";
import { calculateAgeCollaborator, formatDni } from "@/common/helpers/helpers";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useRoles from "@/hooks/useRoles";

interface Props {
  collaborator: Collaborator;
}

const CollaboratorInformation: React.FC<Props> = ({ collaborator }) => {
  const navigate = useNavigate();
  const { isSecretary, isAdmin } = useRoles();
  const initials = `${collaborator.firstName?.[0] || ""}${
    collaborator.lastName?.[0] || ""
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

              {/* Información del Colaborador */}
              <div className="flex-1 min-w-0">
                {/* Nombre */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {collaborator.firstName} {collaborator.lastName}
                </h1>

                {/* Información Específica */}
                <div className="space-y-3">
                  {/* DNI */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <IdCard className="h-5 w-5 text-greenPrimary" />
                    <span className="font-medium">
                      {formatDni(collaborator.userName)}
                    </span>
                  </div>

                  {/* Badges de Género, Edad y Puesto */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                      {collaborator.gender}
                    </Badge>
                    {collaborator.birthDate && (
                      <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                        {calculateAgeCollaborator(String(collaborator.birthDate))} años
                      </Badge>
                    )}
                    {collaborator.positionJob && (
                      <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {collaborator.positionJob}
                      </Badge>
                    )}
                  </div>

                  {/* Empresa */}
                  {collaborator.company && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {collaborator.company.name || "Sin Empresa Asignada"}
                        </p>
                        {collaborator.company.email && (
                          <p className="text-sm text-gray-600">
                            {collaborator.company.email}
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
                    href={`tel:${collaborator.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-greenPrimary/50 transition-all"
                  >
                    <Phone className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {collaborator.phone}
                    </span>
                  </a>


                  {/* Dirección */}
                  {collaborator?.addressData && (
                    <a
                      href="#"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-greenPrimary/50 transition-all"
                    >
                      <MapPin className="h-5 w-5 text-greenPrimary flex-shrink-0" />
                      <div className="text-sm font-medium text-gray-900">
                        {collaborator.addressData?.street && (
                          <div>{collaborator.addressData.street}</div>
                        )}
                        {(collaborator.addressData?.city?.name || collaborator.addressData?.city?.state?.name) && (
                          <div className="text-xs text-gray-600">
                            {collaborator.addressData.city?.state?.name && collaborator.addressData.city?.name
                              ? `${collaborator.addressData.city.state.name}, ${collaborator.addressData.city.name}`
                              : collaborator.addressData.city?.state?.name || collaborator.addressData.city?.name}
                          </div>
                        )}
                      </div>
                    </a>
                  )}
                </div>

                {/* Botones */}
                <div className="flex flex-col gap-3">
                  {(isSecretary || isAdmin) && (
                    <Button
                      onClick={() =>
                        navigate(
                          `/incor-laboral/colaboradores/${collaborator?.firstName.toLowerCase()}-${collaborator?.lastName.toLowerCase()}-${collaborator?.id}/editar`
                        )
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar Colaborador
                    </Button>
                  )}
                  <Link
                    to={`/incor-laboral/colaboradores/${collaborator?.firstName.toLowerCase()}-${collaborator?.lastName.toLowerCase()}-${collaborator?.id}/perfil`}
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
        </div>
      </Card>
    </motion.div>
  );
};

export default CollaboratorInformation;
