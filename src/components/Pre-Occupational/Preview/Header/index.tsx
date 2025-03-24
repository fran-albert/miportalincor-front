import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Company } from "@/types/Company/Company";
import React from "react";
import CollaboratorAvatar from "@/components/Collaborators/Avatar";

interface HeaderPreviewProps {
  collaborator: Collaborator;
  companyData: Company;
}

const HeaderPreview: React.FC<HeaderPreviewProps> = ({
  collaborator,
  companyData,
}) => {
  return (
    <div>
      {/* Encabezado en recuadro */}
      <div className="border border-gray-900 p-2 mb-4">
        <div className="flex h-[70px] items-center justify-between">
          {/* Izquierda: Logo (alineado a la izquierda con padding) */}
          <div className="flex items-center w-1/2 pl-4">
            <img
              src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1740699262/wrivrtuyqs3yqo299ooo.png"
              alt="Logo Empresa"
              className="h-8 w-auto"
            />
          </div>

          {/* Línea divisoria */}
          <div className="h-full w-px bg-gray-800" />

          {/* Derecha: Texto (alineado centrado verticalmente) */}
          <div className="flex flex-col items-center justify-center w-1/2 pr-4">
            <h1 className="text-sm font-bold">Examen Clínico</h1>
            <h2 className="text-xs">Preocupacional</h2>
          </div>
        </div>
      </div>
      {/* Sección Empresa */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-1">Empresa</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1">Nombre: {companyData.name}</p>
            <p className="mb-1">Cuit: {companyData.taxId}</p>
          </div>
          <div>
            <p className="mb-1">Teléfono: {companyData.phone}</p>
            <p className="mb-1">Domicilio: {companyData.address}</p>
          </div>
        </div>
      </div>
      {/* Sección Trabajador */}
      <div className="mb-4">
        <h2 className="text-base font-bold mb-1">Trabajador</h2>
        <div className="grid grid-cols-3 gap-2">
          {/* Información del colaborador en dos columnas */}
          <div className="col-span-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1">
                  Apellido y Nombre: {collaborator.lastName}{" "}
                  {collaborator.firstName}
                </p>
                <p className="mb-1">
                  Fecha Nac: {String(collaborator.birthDate)}
                </p>
                <p className="mb-1">Estado Cívil: </p>
                <p className="mb-1">Tarea Propuesta: </p>
              </div>
              <div>
                <p className="mb-1">D.N.I.: {collaborator.userName}</p>
                <p className="mb-1">
                  Domicilio: {collaborator.addressData?.city.name}
                </p>
                <p className="mb-1">Teléfono: {collaborator.phone}</p>
                <p className="mb-1">
                  Localidad: {collaborator.addressData?.city.name}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-1">Antecedentes Personales:</p>
            </div>
          </div>

          {/* Imagen del colaborador a la derecha */}
          <div className="flex items-center justify-center">
            <CollaboratorAvatar
              src={collaborator.photoUrl}
              alt={`${collaborator.firstName} ${collaborator.lastName}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderPreview;
