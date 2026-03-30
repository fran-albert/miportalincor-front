import { Helmet } from "react-helmet-async";
import { FileBadge2 } from "lucide-react";
import LaborReportBrandingConfigManager from "@/components/Labor-Report-Branding-Config";
import { PageHeader } from "@/components/PageHeader";
import useLaboralPermissions from "@/hooks/Laboral/useLaboralPermissions";

export default function LaborReportBrandingConfigPage() {
  const { canWriteLaboralReportConfig } = useLaboralPermissions();
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Informes laborales" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Informes laborales</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Informes laborales"
        description="Administrá branding institucional, firmantes y política documental del módulo de laboral."
        icon={<FileBadge2 className="h-6 w-6" />}
        badge={canWriteLaboralReportConfig ? "Edición" : "Solo lectura"}
      />

      <LaborReportBrandingConfigManager />
    </div>
  );
}
