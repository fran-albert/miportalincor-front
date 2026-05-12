import { useMemo } from "react";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { GiHypodermicTest } from "react-icons/gi";
import { LabPatientTable } from "../Table/table";
import { ParsingAlert } from "../ParsingAlert";
// import LabChartsGrid from "../Chart/LabsChartGrid";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";

interface Study {
  id: number | string;
  date: string;
}

const LabCard = ({
  bloodTestsData = [],
  idUser,
  bloodTests = [],
  role,
  variant = "card",
  fitTableToContainer = false,
}: {
  studiesByUserId: Study[];
  bloodTestsData: BloodTestData[];
  bloodTests: BloodTest[];
  role: string;
  idUser: number;
  variant?: "card" | "embedded";
  fitTableToContainer?: boolean;
}) => {
  const { dismissParsingAlertMutation } = useStudyMutations();

  // Extract unique studies with parsing results
  const studiesWithParsingIssues = useMemo(() => {
    const studyMap = new Map<
      string,
      { studyId: string; date: string; parsingResult: NonNullable<BloodTestData["study"]["parsingResult"]> }
    >();

    bloodTestsData.forEach((item) => {
      const studyId = String(item.study.id);
      if (item.study.parsingResult && !studyMap.has(studyId)) {
        studyMap.set(studyId, {
          studyId,
          date: item.study.date,
          parsingResult: item.study.parsingResult,
        });
      }
    });

    return Array.from(studyMap.values());
  }, [bloodTestsData]);

  const handleDismissAlert = (studyId: string) => {
    dismissParsingAlertMutation.mutate(studyId);
  };

  // Only show alerts to doctors
  const showAlerts = role === "doctor";
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

  const alerts =
    showAlerts && studiesWithParsingIssues.length > 0 ? (
      <ParsingAlert
        parsingInfos={studiesWithParsingIssues}
        onDismiss={handleDismissAlert}
        isLoading={dismissParsingAlertMutation.isPending}
      />
    ) : null;
  const table = (
    <LabPatientTable
      bloodTests={bloodTests || []}
      bloodTestsData={bloodTestsData || []}
      idUser={idUser}
      fitContainer={fitTableToContainer}
    />
  );

  if (variant === "embedded") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {alerts}
        {table}
      </div>
    );
  }

  return (
    <>
      {alerts}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-greenPrimary">
            <GiHypodermicTest className="mr-2" />
            Laboratorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {table}
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
