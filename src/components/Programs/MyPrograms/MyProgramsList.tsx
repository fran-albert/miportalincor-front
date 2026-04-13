import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";
import MyProgramCard from "./MyProgramCard";
import { Card, CardContent } from "@/components/ui/card";

interface MyProgramsListProps {
  enrollments: ProgramEnrollment[];
}

export default function MyProgramsList({ enrollments }: MyProgramsListProps) {
  if (enrollments.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <div className="mx-auto max-w-xl space-y-2">
            <p className="text-base font-semibold text-slate-900">
              Todavía no tenés programas activos.
            </p>
            <p className="text-sm leading-6 text-slate-500">
              Cuando te inscriban a un programa, lo vas a ver acá con tu plan,
              asistencias y seguimiento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {enrollments.map((enrollment) => (
        <MyProgramCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
