import { useState } from "react";
import { DataTable } from "@/components/Table/table";
import { useProgramEnrollments } from "@/hooks/Program/useProgramEnrollments";
import { useProgramMembership } from "@/hooks/Program/useProgramMembership";
import { useProgramActivities } from "@/hooks/Program/useProgramActivities";
import { getEnrollmentColumns } from "./columns";
import EnrollPatientDialog from "./EnrollPatientDialog";
import UpdateEnrollmentStatusDialog from "./UpdateEnrollmentStatusDialog";
import ManualAttendanceDialog from "@/components/Programs/Enrollment/Attendance/ManualAttendanceDialog";
import QuickNoteDialog from "@/components/Programs/Enrollment/FollowUp/QuickNoteDialog";
import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";

interface EnrollmentsTabProps {
  programId: string;
}

const getPatientName = (enrollment: ProgramEnrollment) =>
  enrollment.patientFirstName
    ? `${enrollment.patientFirstName} ${enrollment.patientLastName}`
    : enrollment.patientUserId;

export default function EnrollmentsTab({ programId }: EnrollmentsTabProps) {
  const { canManageEnrollments, canCreateNotes } =
    useProgramMembership(programId);
  const { enrollments, isFetching } = useProgramEnrollments(programId);
  const { activities } = useProgramActivities(programId);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [statusEnrollment, setStatusEnrollment] =
    useState<ProgramEnrollment | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [attendanceEnrollment, setAttendanceEnrollment] =
    useState<ProgramEnrollment | null>(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [noteEnrollment, setNoteEnrollment] =
    useState<ProgramEnrollment | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const handleChangeStatus = (enrollment: ProgramEnrollment) => {
    setStatusEnrollment(enrollment);
    setIsStatusOpen(true);
  };

  const handleRegisterAttendance = (enrollment: ProgramEnrollment) => {
    setAttendanceEnrollment(enrollment);
    setIsAttendanceOpen(true);
  };

  const handleNewNote = (enrollment: ProgramEnrollment) => {
    setNoteEnrollment(enrollment);
    setIsNoteOpen(true);
  };

  const columns = getEnrollmentColumns(
    programId,
    canManageEnrollments,
    canCreateNotes,
    handleChangeStatus,
    handleRegisterAttendance,
    handleNewNote
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={enrollments}
        showSearch
        canAddUser={canManageEnrollments}
        onAddClick={() => setIsEnrollOpen(true)}
        addLinkPath=""
        addLinkText="Inscribir Paciente"
        isFetching={isFetching}
      />
      {canManageEnrollments ? (
        <EnrollPatientDialog
          programId={programId}
          isOpen={isEnrollOpen}
          setIsOpen={setIsEnrollOpen}
        />
      ) : null}
      {isStatusOpen && statusEnrollment && (
        <UpdateEnrollmentStatusDialog
          programId={programId}
          enrollment={statusEnrollment}
          isOpen={isStatusOpen}
          setIsOpen={setIsStatusOpen}
        />
      )}
      {isAttendanceOpen && attendanceEnrollment && (
        <ManualAttendanceDialog
          enrollmentId={attendanceEnrollment.id}
          patientUserId={attendanceEnrollment.patientUserId}
          activities={activities}
          isOpen={isAttendanceOpen}
          setIsOpen={setIsAttendanceOpen}
          patientName={getPatientName(attendanceEnrollment)}
        />
      )}
      {canCreateNotes && isNoteOpen && noteEnrollment ? (
        <QuickNoteDialog
          enrollmentId={noteEnrollment.id}
          patientName={getPatientName(noteEnrollment)}
          isOpen={isNoteOpen}
          setIsOpen={setIsNoteOpen}
        />
      ) : null}
    </div>
  );
}
