import React from "react";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Company } from "@/types/Company/Company";
import CollaboratorAvatarHtml from "./Collaborator-Avatar";
import AntecedentesList from "../View/Antecedentes";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { formatAddress, formatCuilCuit } from "@/common/helpers/helpers";

interface CollaboratorInformationHtmlProps {
  collaborator: Collaborator;
  companyData: Company;
  antecedentes: DataValue[];
}

const CollaboratorInformationHtml: React.FC<
  CollaboratorInformationHtmlProps
> = ({ collaborator, companyData, antecedentes }) => {
  console.log(companyData);

  return (
    <div className="p-[10px]">
      {/* Sección Empresa */}
      <div className="mb-[8px]">
        <h2 className="font-bold mb-[4px]">Empresa</h2>
        <div className="flex flex-row justify-between">
          <div className="flex-1 pr-[4px]">
            <p className="mb-[2px]">Nombre: {companyData.name}</p>
            <p className="mb-[2px]">
              Cuit: {formatCuilCuit(companyData.taxId)}
            </p>
          </div>
          <div className="flex-1 pl-[4px]">
            <p className="mb-[2px]">Teléfono: {companyData.phone}</p>
            <p className="mb-[2px]">
              Domicilio: {formatAddress(companyData.addressData)}
            </p>
          </div>
        </div>
      </div>

      {/* Sección Trabajador */}
      <div className="mb-[8px]">
        <h2 className="font-bold mb-[4px]">Trabajador</h2>
        <div className="flex flex-row justify-between">
          {/* Información del colaborador */}
          <div className="flex-[2] pr-[4px]">
            <div className="flex flex-row">
              <div className="flex-1 pr-[4px]">
                <p className=" mb-[2px]">
                  Apellido y Nombre: {collaborator.lastName}{" "}
                  {collaborator.firstName}
                </p>
                <p className="mb-[2px]">
                  Fecha Nac: {String(collaborator.birthDate)}
                </p>
                <p className="mb-[2px]">
                  Puesto de Trabajo:{collaborator.positionJob}
                </p>
              </div>
              <div className="flex-1 pl-[4px]">
                <p className="mb-[2px]">D.N.I.: {collaborator.userName}</p>
                <p className="mb-[2px]">
                  Domicilio: {collaborator.addressData?.city.name}
                </p>
                <p className="mb-[2px]">Teléfono: {collaborator.phone}</p>
                <p className="mb-[2px]">
                  Localidad: {collaborator.addressData?.city.name}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <AntecedentesList dataValues={antecedentes} />
            </div>
          </div>

          <div className="flex items-center justify-center flex-1">
            <CollaboratorAvatarHtml
              alt={collaborator.firstName}
              src={collaborator.photoUrl}
              photoDataUrl={collaborator.photoDataUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorInformationHtml;
