import { useState } from "react";
import { DataTable } from "@/components/Table/table";
import { useProgramMembership } from "@/hooks/Program/useProgramMembership";
import { useAttendanceRecords } from "@/hooks/Program/useAttendanceRecords";
import { getAttendanceColumns } from "./columns";
import ManualAttendanceDialog from "./ManualAttendanceDialog";
import { ProgramActivity } from "@/types/Program/ProgramActivity";

interface AttendanceTabProps {
  programId: string;
  enrollmentId: string;
  patientUserId: string;
  activities: ProgramActivity[];
}

export default function AttendanceTab({
  programId,
  enrollmentId,
  patientUserId,
  activities,
}: AttendanceTabProps) {
  const { canRegisterAttendance } = useProgramMembership(programId);
  const { records, isFetching } = useAttendanceRecords(enrollmentId);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const columns = getAttendanceColumns();

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={records}
        showSearch
        canAddUser={canRegisterAttendance}
        onAddClick={() => setIsManualOpen(true)}
        addLinkPath=""
        addLinkText="Registrar Asistencia"
        isFetching={isFetching}
      />
      <ManualAttendanceDialog
        enrollmentId={enrollmentId}
        patientUserId={patientUserId}
        activities={activities}
        isOpen={isManualOpen}
        setIsOpen={setIsManualOpen}
      />
    </div>
  );
}
