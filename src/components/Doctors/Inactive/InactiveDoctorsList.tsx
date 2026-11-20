import { UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDni, formatMatricula } from "@/common/helpers/helpers";
import { useInactiveDoctors } from "@/hooks/Doctor/useDoctorActivation";
import ReactivateDoctorDialog from "./ReactivateDoctorDialog";

export default function InactiveDoctorsList() {
  const { doctors, isLoading, isError } = useInactiveDoctors(true);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-1/3 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-700" role="alert">
          No pudimos traer los médicos desactivados. Probá de nuevo en un rato.
        </CardContent>
      </Card>
    );
  }

  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <UserX className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p>No hay médicos desactivados.</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...doctors].sort((left, right) =>
    `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`, "es")
  );

  return (
    <Card>
      <CardContent className="p-0">
        <Table aria-label="Médicos desactivados">
          <TableHeader>
            <TableRow>
              <TableHead>Médico</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead className="w-[140px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((doctor) => {
              const doctorName = `${doctor.lastName}, ${doctor.firstName}`;
              return (
                <TableRow key={doctor.id || doctor.userId}>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">{doctorName}</p>
                    {doctor.email && (
                      <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {doctor.matricula ? formatMatricula(doctor.matricula) : "Sin matrícula"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDni(doctor.dni || doctor.userName)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ReactivateDoctorDialog
                      doctorId={doctor.id || String(doctor.userId)}
                      doctorName={doctorName}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
