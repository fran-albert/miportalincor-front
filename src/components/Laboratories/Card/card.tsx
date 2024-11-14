import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { GiHypodermicTest } from "react-icons/gi";
import { LabPatientTable } from "../Table/table";
import { Lab } from "@/types/Lab/Lab";

const LabCard = ({
  labsDetails,
  studiesByUserId,
  idUser,
}: {
  labsDetails: Lab[];
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
          <LabPatientTable
            labsDetails={labsDetails}
            studiesByUser={studiesByUserId}
            idUser={idUser}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LabCard;
