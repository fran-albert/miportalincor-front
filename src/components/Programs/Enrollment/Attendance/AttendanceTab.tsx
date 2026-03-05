import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { useAttendanceRecords } from "@/hooks/Program/useAttendanceRecords";
import { getAttendanceColumns } from "./columns";
import ManualAttendanceDialog from "./ManualAttendanceDialog";
import { ProgramActivity } from "@/types/Program/ProgramActivity";

interface AttendanceTabProps {
  enrollmentId: string;
  patientUserId: string;
  activities: ProgramActivity[];
}

export default function AttendanceTab({
  enrollmentId,
  patientUserId,
  activities,
}: AttendanceTabProps) {
  const { isAdmin, isDoctor, isProfesor } = useRoles();
  const { records, isFetching } = useAttendanceRecords(enrollmentId);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const canRegister = isAdmin || isDoctor || isProfesor;

  const columns = getAttendanceColumns();

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={records}
        showSearch
        canAddUser={canRegister}
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
