import { ReactNode } from "react";
import { AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDni } from "@/common/helpers/helpers";
import { Notice, StepFrame } from "../StepFrame";
import { normalizeArgentineMobile } from "../signup.schemas";
import { DataStep, SignupFormData } from "../types";

interface StepSummaryProps {
  data: SignupFormData;
  onEdit: (step: DataStep) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
  dniLocked: boolean;
}

function Block({
  title,
  step,
  onEdit,
  children,
  canEdit = true,
}: {
  title: string;
  step: DataStep;
  onEdit: (step: DataStep) => void;
  children: ReactNode;
  canEdit?: boolean;
}) {
  return (
    <section
      className="rounded-lg border border-slate-200 bg-white p-4"
      data-testid={`summary-${step}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="text-sm font-semibold text-greenPrimary uppercase tracking-wide">
          {title}
        </h2>
        {canEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-greenPrimary hover:text-teal-700"
            onClick={() => onEdit(step)}
            aria-label={`Editar ${title.toLowerCase()}`}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </Button>
        )}
      </div>
      <dl className="space-y-1 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right break-all">{value}</dd>
    </div>
  );
}

const formatPhone = (raw: string): string => {
  const digits = normalizeArgentineMobile(raw) ?? raw;
  return digits.length === 10
    ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    : raw;
};

export function StepSummary({
  data,
  onEdit,
  onBack,
  onSubmit,
  isSubmitting,
  error,
  dniLocked,
}: StepSummaryProps) {
  return (
    <StepFrame
      title="Revisá tus datos"
      description="Si algo está mal, tocá Editar. Después, creá tu cuenta."
      onBack={onBack}
      onNext={onSubmit}
      nextLabel="Crear mi cuenta"
      isNextLoading={isSubmitting}
      nextTestId="signup-submit"
    >
      <Block title="DNI" step="dni" onEdit={onEdit} canEdit={!dniLocked}>
        <Row label="DNI" value={formatDni(data.dni)} />
      </Block>
      <Block title="Tus datos" step="personal" onEdit={onEdit}>
        <Row label="Nombre" value={`${data.firstName.trim()} ${data.lastName.trim()}`} />
        <Row label="Celular" value={formatPhone(data.phone)} />
        <Row label="Email" value={data.email.trim() || "Sin email"} />
        <Row label="Nacimiento" value={data.birthDate} />
      </Block>
      <Block title="Obra social" step="health" onEdit={onEdit}>
        <Row label="Obra social" value={data.healthInsuranceName} />
        {data.healthPlanName && data.healthPlanName !== data.healthInsuranceName && (
          <Row label="Plan" value={data.healthPlanName} />
        )}
        {data.requiresAffiliationNumber && (
          <Row label="N° de afiliado" value={data.affiliationNumber} />
        )}
      </Block>
      <Block title="Dirección" step="address" onEdit={onEdit}>
        <Row
          label="Domicilio"
          value={`${data.street.trim()} ${data.number.trim()}${
            data.description.trim() ? `, ${data.description.trim()}` : ""
          }`}
        />
        <Row label="Ciudad" value={`${data.cityName}, ${data.stateName}`} />
      </Block>
      <Block title="Contraseña" step="password" onEdit={onEdit}>
        <Row label="Contraseña" value={"•".repeat(Math.min(data.password.length, 12))} />
      </Block>

      {error && (
        <Notice
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          tone="error"
          testId="signup-submit-error"
        >
          <p>{error}</p>
        </Notice>
      )}
    </StepFrame>
  );
}
