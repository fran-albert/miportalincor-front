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
import { useDoctorScheduleExceptions } from "@/hooks/DoctorScheduleException";
import { CalendarRange } from "lucide-react";
import { formatDateAR } from "@/common/helpers/timezone";
import { motion } from "framer-motion";

interface MyScheduleExceptionsProps {
  doctorId: number;
}

export const MyScheduleExceptions = ({ doctorId }: MyScheduleExceptionsProps) => {
  const { exceptions, isLoading } = useDoctorScheduleExceptions({
    doctorId,
    enabled: doctorId > 0,
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

  if (exceptions.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarRange className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-lg text-muted-foreground">No tenés excepciones por fecha</p>
        <p className="text-sm text-muted-foreground">
          Cuando secretaría cargue una franja especial para un día puntual aparecerá aquí
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Duración del turno</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => (
                  <TableRow key={exception.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {formatDateAR(exception.date)}
                    </TableCell>
                    <TableCell>
                      {exception.startTime} - {exception.endTime}
                    </TableCell>
                    <TableCell>{exception.slotDuration} min</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          exception.isActive
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }
                      >
                        {exception.isActive ? "Activa" : "Inactiva"}
                      </Badge>
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
