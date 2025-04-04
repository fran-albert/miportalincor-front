import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { BsFillFileTextFill } from "react-icons/bs";
import { StudiesWithURL } from "@/types/Study/Study";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyTypeSelect } from "@/components/Select/Study/By-Type/select";
import { StudyYearSelect } from "@/components/Select/Study/By-Year/select";
import StudiesTable from "../Table";
import { Link } from "react-router-dom";

interface Props {
  studies: StudiesWithURL[];
  idUser: number;
  slug: string;
  role: string;
}
const StudiesComponent = ({ studies, idUser, slug, role }: Props) => {
  const { isDoctor } = useRoles();
  const [selectedStudyType, setSelectedStudyType] = useState<string | null>(
    "Seleccionar tipo de estudio..."
  );
  const [selectedYear, setSelectedYear] = useState<string | null>(
    "Seleccionar año..."
  );

  const groupStudiesByType = (studiesByUserId: StudiesWithURL[]) => {
    if (!Array.isArray(studiesByUserId)) {
      return {};
    }

    return studiesByUserId.reduce((acc, study) => {
      const name = study.studyType?.name;
      if (!name) return acc;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(study);
      return acc;
    }, {} as Record<string, StudiesWithURL[]>);
  };

  const groupStudiesByYear = (studiesByUserId: StudiesWithURL[]) => {
    return studiesByUserId?.reduce((acc, study) => {
      if (!study.date) {
        return acc;
      }

      const year = new Date(study.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(study);
      return acc;
    }, {} as Record<string, StudiesWithURL[]>);
  };

  const groupedStudies = groupStudiesByType(studies);
  const groupedYears = groupStudiesByYear(studies);

  const filteredStudies = studies.filter((study) => {
    const matchesType =
      selectedStudyType === "Seleccionar tipo de estudio..." ||
      study.studyType?.name === selectedStudyType;

    const matchesYear =
      selectedYear === "Seleccionar año..." ||
      (study.date &&
        new Date(study.date).getFullYear().toString() === selectedYear);

    return matchesType && matchesYear;
  });

  const studyTypes = [
    "Seleccionar tipo de estudio...",
    ...Object.keys(groupedStudies),
  ];
  const studyYears = ["Seleccionar año...", ...Object.keys(groupedYears)];

  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <CardTitle className="flex items-center text-greenPrimary">
          <BsFillFileTextFill className="mr-2" />
          Estudios Médicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDoctor && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <StudyTypeSelect
              studyTypes={studyTypes}
              selectedStudyType={selectedStudyType}
              onStudyTypeChange={setSelectedStudyType}
            />
            <StudyYearSelect
              years={studyYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
            <Button variant="outline">
              <Link
                className="text-gray-600 hover:text-gray-800"
                to={`/${role}/${slug}/laboratorios`}
              >
                Ver Tabla Laboratorios
              </Link>
            </Button>
          </div>
        )}
        <StudiesTable studies={filteredStudies} idUser={Number(idUser)} />
      </CardContent>
    </Card>
  );
};

export default StudiesComponent;
