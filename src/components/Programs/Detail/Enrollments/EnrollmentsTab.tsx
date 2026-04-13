import { useState } from "react";
import { DataTable } from "@/components/Table/table";
import { useProgramEnrollments } from "@/hooks/Program/useProgramEnrollments";
import { useProgramMembership } from "@/hooks/Program/useProgramMembership";
import { getEnrollmentColumns } from "./columns";
import EnrollPatientDialog from "./EnrollPatientDialog";
import UpdateEnrollmentStatusDialog from "./UpdateEnrollmentStatusDialog";
import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";

interface EnrollmentsTabProps {
  programId: string;
}

export default function EnrollmentsTab({ programId }: EnrollmentsTabProps) {
  const { isCoordinator } = useProgramMembership(programId);
  const { enrollments, isFetching } = useProgramEnrollments(programId);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [statusEnrollment, setStatusEnrollment] =
    useState<ProgramEnrollment | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const handleChangeStatus = (enrollment: ProgramEnrollment) => {
    setStatusEnrollment(enrollment);
    setIsStatusOpen(true);
  };

  const columns = getEnrollmentColumns(
    programId,
    isCoordinator,
    handleChangeStatus
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={enrollments}
        showSearch
        canAddUser={isCoordinator}
        onAddClick={() => setIsEnrollOpen(true)}
        addLinkPath=""
        addLinkText="Inscribir Paciente"
        isFetching={isFetching}
      />
      <EnrollPatientDialog
        programId={programId}
        isOpen={isEnrollOpen}
        setIsOpen={setIsEnrollOpen}
      />
      {isStatusOpen && statusEnrollment && (
        <UpdateEnrollmentStatusDialog
          programId={programId}
          enrollment={statusEnrollment}
          isOpen={isStatusOpen}
          setIsOpen={setIsStatusOpen}
        />
      )}
    </div>
  );
}
