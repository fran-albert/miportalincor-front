import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { GiHypodermicTest } from "react-icons/gi";
import { LabPatientTable } from "../Table/table";
import { Lab } from "@/types/Lab/Lab";
import LabChartsGrid from "../Chart/LabsChartGrid";

interface Study {
  id: number;
  date: string;
}

const addDatesToLabResults = (
  labsDetails: Lab[],
  studiesByUserId: Study[]
): Lab[] => {
  const updatedLabs = labsDetails.map((lab) => {
    const study = studiesByUserId.find((study) => study.id === lab.idStudy);
    const date = study?.date || "";
    if (!date) {
      console.warn("No date found for lab:", lab);
    }
    return {
      ...lab,
      date,
    };
  });

  return updatedLabs;
};

const LabCard = ({
  labsDetails,
  studiesByUserId,
  idUser,
}: {
  labsDetails: Lab[];
  studiesByUserId: Study[];
  role: string;
  idUser: number;
}) => {
  // Añadir las fechas y ordenar los datos por fecha descendente
  const labsDetailsWithDates = addDatesToLabResults(labsDetails, studiesByUserId).sort(
    (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
  );

  // Filtrar las claves de `Lab` relevantes para gráficos
  const labKeys = Object.keys(labsDetails[0] || {}).filter((key) => {
    const value = String(labsDetails[0][key as keyof Lab]); // Convertir a string
    return (
      key !== "id" && // Excluir campos irrelevantes
      key !== "idStudy" &&
      key !== "date" &&
      !isNaN(parseFloat(value)) // Validar si es un número
    );
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-greenPrimary">
            <GiHypodermicTest className="mr-2" />
            Laboratorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LabPatientTable
            labsDetails={labsDetails}
            studiesByUser={studiesByUserId}
            idUser={idUser}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-greenPrimary">
            <GiHypodermicTest className="mr-2" />
            Gráficos de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LabChartsGrid
            labsData={labsDetailsWithDates}
            labKeys={labKeys as (keyof Lab)[]}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LabCard;
