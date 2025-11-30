import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Building2 } from "lucide-react";
import { formatCuilCuit, formatAddress } from "@/common/helpers/helpers";
import { Company } from "@/types/Company/Company";
import { motion } from "framer-motion";

interface Props {
  company: Company;
  totalCollaborators?: number;
}

const CompanyInformation: React.FC<Props> = ({ company, totalCollaborators = 0 }) => {
  const initials = company.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Hero Background con Gradiente */}
        <div className="relative bg-gradient-to-r from-teal-500 to-greenPrimary p-8 pb-20">
          {/* Decorative Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>

        {/* Card Principal Elevada */}
        <div className="relative px-8 -mt-12 pb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar con Gradiente */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-greenPrimary flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>

              {/* Información de la Empresa */}
              <div className="flex-1 min-w-0">
                {/* Nombre */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {company.name}
                </h1>

                {/* Información Específica */}
                <div className="space-y-3">
                  {/* CUIT */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="h-5 w-5 text-teal-600" />
                    <span className="font-medium">CUIT: {formatCuilCuit(company.taxId)}</span>
                  </div>

                  {/* Badge de Colaboradores */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                      {totalCollaborators} Colaborador{totalCollaborators !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="flex flex-col gap-4 md:w-64">
                {/* Información de Contacto */}
                <div className="space-y-3">
                  {/* Teléfono */}
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-teal-500/50 transition-all"
                  >
                    <Phone className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {company.phone}
                    </span>
                  </a>

                  {/* Email */}
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-teal-500/50 transition-all"
                    >
                      <Mail className="h-5 w-5 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {company.email}
                      </span>
                    </a>
                  )}

                  {/* Dirección */}
                  {company.addressData && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatAddress(company.addressData)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CompanyInformation;
