import { Helmet } from "react-helmet-async";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import OperatorPrescriptionRequests from "@/components/Prescription-Request/Operator";

const OperatorPrescriptionRequestsPage = () => {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Bandeja de Recetas" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Bandeja de Recetas - Operador</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Bandeja de Recetas"
        description="Gestione las solicitudes de recetas de todos los médicos"
        icon={<FileText className="h-6 w-6" />}
        actions={
          <Link to="/inicio">
            <Button variant="outline" className="shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        }
      />

      <OperatorPrescriptionRequests />
    </div>
  );
};

export default OperatorPrescriptionRequestsPage;
