import React from "react";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Company } from "@/types/Company/Company";
import AntecedentesList from "../View/Antecedentes";
import { DataValue } from "@/types/Data-Value/Data-Value";
import {
  formatAddress,
  formatCuilCuit,
  formatDni,
} from "@/common/helpers/helpers";
import { pdfColors } from "../Pdf/shared";

interface CollaboratorInformationHtmlProps {
  collaborator: Collaborator;
  companyData: Company;
  antecedentes: DataValue[];
  showAntecedentes?: boolean;
  compactWorkerOnly?: boolean;
}

const normalizeDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const text = String(value).trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") {
    return "-";
  }

  return text;
};

const Field = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <p
      className="mb-0.5 text-[7px] uppercase tracking-[0.1em]"
      style={{ color: pdfColors.muted }}
    >
      {label}
    </p>
    <p className="text-[9px] leading-[1.25]" style={{ color: pdfColors.ink }}>
      {value || "-"}
    </p>
  </div>
);

const CardSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    className="overflow-hidden rounded-[8px] border"
    style={{ borderColor: pdfColors.line }}
  >
    <div
      className="border-b px-[10px] py-[6px]"
      style={{
        backgroundColor: pdfColors.surface,
        borderBottomColor: pdfColors.line,
      }}
    >
      <h2
        className="text-[9px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: pdfColors.accentText }}
      >
        {title}
      </h2>
    </div>
    <div className="px-[10px] py-[8px]">{children}</div>
  </div>
);

const CollaboratorInformationHtml: React.FC<
  CollaboratorInformationHtmlProps
> = ({
  collaborator,
  companyData,
  antecedentes,
  showAntecedentes = true,
  compactWorkerOnly = false,
}) => {
  if (compactWorkerOnly) {
    return (
      <div className="mb-2.5">
        <CardSection title="Trabajador">
          <div className="grid grid-cols-4 gap-x-3 gap-y-1.5">
            <Field
              label="Apellido y nombre"
              value={normalizeDisplayValue(
                `${collaborator.lastName} ${collaborator.firstName}`
              )}
            />
            <Field
              label="DNI"
              value={normalizeDisplayValue(formatDni(collaborator.userName))}
            />
            <Field
              label="Puesto de trabajo"
              value={normalizeDisplayValue(collaborator.positionJob)}
            />
            <Field
              label="Fecha de nacimiento"
              value={normalizeDisplayValue(collaborator.birthDate)}
            />
          </div>
        </CardSection>
      </div>
    );
  }

  return (
    <div className="mb-2.5 space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <CardSection title="Empresa">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <Field
              label="Nombre"
              value={normalizeDisplayValue(companyData.name)}
            />
            <Field
              label="Telefono"
              value={normalizeDisplayValue(companyData.phone)}
            />
            <Field
              label="CUIT"
              value={normalizeDisplayValue(formatCuilCuit(companyData.taxId))}
            />
            <Field
              label="Domicilio"
              value={normalizeDisplayValue(
                formatAddress(companyData.addressData)
              )}
            />
          </div>
        </CardSection>

        <CardSection title="Trabajador">
          <div className="grid grid-cols-[1.25fr_1fr] gap-x-3 gap-y-1.5">
            <Field
              label="Apellido y nombre"
              value={normalizeDisplayValue(
                `${collaborator.lastName} ${collaborator.firstName}`
              )}
            />
            <Field
              label="DNI"
              value={normalizeDisplayValue(formatDni(collaborator.userName))}
            />
            <Field
              label="Fecha de nacimiento"
              value={normalizeDisplayValue(collaborator.birthDate)}
            />
            <Field
              label="Telefono"
              value={normalizeDisplayValue(collaborator.phone)}
            />
            <Field
              label="Puesto de trabajo"
              value={normalizeDisplayValue(collaborator.positionJob)}
            />
            <Field
              label="Localidad"
              value={normalizeDisplayValue(collaborator.addressData?.city.name)}
            />
          </div>
        </CardSection>
      </div>

      {showAntecedentes ? (
        <CardSection title="Antecedentes">
          {antecedentes.length > 0 ? (
            <div className="text-[9px] leading-[1.25]">
              <AntecedentesList dataValues={antecedentes} />
            </div>
          ) : (
            <p className="text-[9px]" style={{ color: pdfColors.muted }}>
              Sin antecedentes ocupacionales registrados.
            </p>
          )}
        </CardSection>
      ) : null}
    </div>
  );
};

export default CollaboratorInformationHtml;
