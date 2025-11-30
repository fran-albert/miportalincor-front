import { Doctor } from "@/types/Doctor/Doctor";
import { Patient } from "@/types/Patient/Patient";
import { AntecedentesResponse } from "@/types/Antecedentes/Antecedentes";
import { DoctorHistoryWrapper } from "@/components/Historia-Clinica/Wrapper";

interface DoctorHistoryComponentProps {
  doctor: Doctor | undefined;
  patient: Patient | undefined; // El paciente que está viendo el doctor
  antecedentes: AntecedentesResponse | undefined;
  isLoadingDoctor: boolean;
}

export function DoctorHistoryComponent({
  doctor,
  patient,
  antecedentes,
  isLoadingDoctor,
}: DoctorHistoryComponentProps) {
  if (isLoadingDoctor) {
    return (
      <div className="space-y-4 p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!doctor || !patient) {
    return (
      <div className="space-y-4 p-6">
        <p>Error: Doctor o paciente no encontrado</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${doctor?.slug}`,
    },
    {
      label: "Historia Clínica",
      href: `/medicos/${doctor.slug}/historia-clinica`,
    },
  ];

  const actions = {
    onEditEvolution: (id: number) => {
      console.log("Editar evolución", id);
      // Implementar lógica de edición
    },
    onDeleteEvolution: (id: number) => {
      console.log("Eliminar evolución", id);
      // Implementar lógica de eliminación
    },
    onAddEvolution: () => {
      console.log("Agregar nueva evolución");
      // Implementar lógica para agregar
    },
    onEditAntecedentes: () => {
      console.log("Editar antecedentes");
      // Implementar lógica de edición de antecedentes
    },
  };

  return (
    <DoctorHistoryWrapper
      userData={patient} // Pasamos el paciente como userData porque es la historia del paciente
      antecedentes={antecedentes}
      breadcrumbItems={breadcrumbItems}
      actions={actions}
    />
  );
}
