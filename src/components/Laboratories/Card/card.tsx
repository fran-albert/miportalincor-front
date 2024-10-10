import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { GiHypodermicTest } from "react-icons/gi";
import { LabPatientTable } from "../Table/table";
import { Lab } from "@/types/Lab/Lab";

const LabCard = ({
  labsDetails,
  role,
  studiesByUserId,
  idUser,
}: {
  labsDetails: Lab[] | undefined;
  studiesByUserId: any[];
  role: string;
  idUser: number;
}) => {
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
          {labsDetails && labsDetails.length > 0 ? (
            <LabPatientTable
              labsDetails={labsDetails}
              studiesByUser={studiesByUserId}
              idUser={idUser}
            />
          ) : (
            <p className="text-gray-500">
              No hay laboratorios disponibles para este {role}.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default LabCard;
