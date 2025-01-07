import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { GiHypodermicTest } from "react-icons/gi";
import { LabPatientTable } from "../Table/table";
// import LabChartsGrid from "../Chart/LabsChartGrid";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

interface Study {
  id: number;
  date: string;
}

const LabCard = ({
  bloodTestsData = [],
  idUser,
  bloodTests = [],
}: {
  studiesByUserId: Study[];
  bloodTestsData: BloodTestData[];
  bloodTests: BloodTest[];
  role: string;
  idUser: number;
}) => {
  // const labKeys =
  //   bloodTestsData.length > 0
  //     ? Object.keys(bloodTestsData[0]).filter((key) => {
  //         const value = String(
  //           bloodTestsData[0][key as keyof BloodTestData] || ""
  //         );
  //         return (
  //           key !== "id" && key !== "date" && !isNaN(parseFloat(value)) // Filtrar solo claves numéricas
  //         );
  //       })
  //     : [];

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
            bloodTests={bloodTests || []}
            bloodTestsData={bloodTestsData || []}
            idUser={idUser}
          />
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-greenPrimary">
            <GiHypodermicTest className="mr-2" />
            Gráficos de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bloodTestsData.length > 0 && labKeys.length > 0 ? (
            <LabChartsGrid bloodTestsData={bloodTestsData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <GiHypodermicTest className="text-gray-400 text-4xl" />
              <p className="text-gray-500 mt-2">
                Sin datos para mostrar gráficos.
              </p>
            </div>
          )}
        </CardContent>
      </Card> */}
    </>
  );
};

export default LabCard;
