import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DoctorAbsenceResponseDto,
  Absence,
  AbsenceLabels
} from "@/types/Doctor-Absence/Doctor-Absence";
import { useDoctorAbsences } from "@/hooks/DoctorAbsence";
import { CalendarOff, Palmtree, FileText, HelpCircle } from "lucide-react";
import { formatDateAR } from "@/common/helpers/timezone";
import { motion } from "framer-motion";

interface MyAbsencesProps {
  doctorId: number;
}

const getAbsenceIcon = (type: Absence) => {
  switch (type) {
    case Absence.VACATION:
      return <Palmtree className="h-4 w-4" />;
    case Absence.LICENCE:
      return <FileText className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

const getAbsenceBadgeColor = (type: Absence) => {
  switch (type) {
    case Absence.VACATION:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case Absence.LICENCE:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const formatTimeRange = (absence: DoctorAbsenceResponseDto) => {
  if (!absence.startTime && !absence.endTime) {
    return 'Todo el día';
  }
  return `${absence.startTime || '00:00'} - ${absence.endTime || '23:59'}`;
};

export const MyAbsences = ({ doctorId }: MyAbsencesProps) => {
  const { absences, isLoading } = useDoctorAbsences({
    doctorId,
    enabled: doctorId > 0
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (absences.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-lg text-muted-foreground">No tenés ausencias registradas</p>
        <p className="text-sm text-muted-foreground">
          Cuando se registren vacaciones o licencias aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tipo</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead>Horario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absences.map((absence) => (
                  <TableRow key={absence.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getAbsenceBadgeColor(absence.type)} flex items-center gap-1 w-fit`}
                      >
                        {getAbsenceIcon(absence.type)}
                        {AbsenceLabels[absence.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatDateAR(absence.startDate)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatDateAR(absence.endDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimeRange(absence)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MyAbsences;
