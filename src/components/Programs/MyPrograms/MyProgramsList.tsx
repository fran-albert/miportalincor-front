import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";
import MyProgramCard from "./MyProgramCard";

interface MyProgramsListProps {
  enrollments: ProgramEnrollment[];
}

export default function MyProgramsList({ enrollments }: MyProgramsListProps) {
  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No estás inscripto en ningún programa.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => (
        <MyProgramCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
