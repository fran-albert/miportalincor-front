import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import LoadingAnimation from "@/components/Loading/loading";
import { PageHeader } from "@/components/PageHeader";
import { UserCheck } from "lucide-react";
import CollaboratorInformation from "@/components/Collaborators/Dashboard/Collaborator-Information";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CollaboratorProfilePage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id, formattedName } = parseSlug(slug);
  const { collaborator, isLoading } = useCollaborator({
    auth: true,
    id,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName.charAt(0).toUpperCase() + collaborator.firstName.slice(1).toLowerCase()} ${collaborator.lastName.charAt(0).toUpperCase() + collaborator.lastName.slice(1).toLowerCase()}`
        : formattedName,
      href: `/incor-laboral/colaboradores/${slug}`,
    },
    { label: "Perfil Completo" },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Helmet>
        <title>Perfil - {formattedName}</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={`Perfil de ${formattedName}`}
          description="Información completa y detallada del colaborador"
          icon={<UserCheck className="h-6 w-6" />}
        />

        {collaborator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Información Principal */}
            <CollaboratorInformation collaborator={collaborator} />

            {/* Información Detallada en Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Datos Laborales */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Información Laboral</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Puesto</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {collaborator.positionJob || "Sin asignar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Empresa</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {collaborator.company?.name || "Sin empresa"}
                    </p>
                  </div>
                  {collaborator.company?.email && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Email de Empresa
                      </p>
                      <a
                        href={`mailto:${collaborator.company.email}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {collaborator.company.email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Datos de Dirección */}
              {collaborator.addressData && (
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg">Dirección</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {collaborator.addressData?.street && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Calle</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {collaborator.addressData.street}
                        </p>
                      </div>
                    )}
                    {(collaborator.addressData?.number ||
                      collaborator.addressData?.floorNumber ||
                      collaborator.addressData?.departmentNumber) && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Número, Piso, Depto
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {collaborator.addressData.number || "-"}
                          {collaborator.addressData.floorNumber &&
                            `, Piso ${collaborator.addressData.floorNumber}`}
                          {collaborator.addressData.departmentNumber &&
                            `, Depto ${collaborator.addressData.departmentNumber}`}
                        </p>
                      </div>
                    )}
                    {collaborator.addressData?.city && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Localidad</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {collaborator.addressData.city.name}
                        </p>
                      </div>
                    )}
                    {collaborator.addressData?.city?.state && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Provincia</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {collaborator.addressData.city.state.name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Datos Personales */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Datos Personales</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {collaborator.firstName} {collaborator.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">DNI</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {collaborator.userName}
                    </p>
                  </div>
                  {collaborator.birthDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fecha Nacimiento</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof collaborator.birthDate === 'string'
                          ? collaborator.birthDate
                          : new Date(collaborator.birthDate).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  )}
                  {collaborator.gender && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Género</p>
                      <Badge className="bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20">
                        {collaborator.gender}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Datos de Contacto */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Contacto</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {collaborator.email && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${collaborator.email}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {collaborator.email}
                      </a>
                    </div>
                  )}
                  {collaborator.phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                      <a
                        href={`tel:${collaborator.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {collaborator.phone}
                      </a>
                    </div>
                  )}
                  {collaborator.addressData?.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Observaciones</p>
                      <p className="text-gray-900">
                        {collaborator.addressData.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default CollaboratorProfilePage;
