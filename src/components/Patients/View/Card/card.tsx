import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  User,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Droplet,
  Info,
} from "lucide-react";
import { Patient } from "@/types/Patient/Patient";
import {
  calculateAge,
  formatDate,
  formatDateWithTime,
  formatDni,
} from "@/common/helpers/helpers";
import { Button } from "@/components/ui/button";
import ResetDefaultPasswordDialog from "@/components/Button/Reset-Default-Password";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
const PatientCardComponent = ({ patient }: { patient: Patient | null }) => {
  const registerByText =
    patient?.registeredByName +
    " " +
    "- " +
    formatDateWithTime(String(patient?.registrationDate));

  return (
    <Card className="w-full max-w-sm border-2">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-bold text-greenPrimary">
          {patient?.firstName} {patient?.lastName}
        </h2>
        <p className="text-sm text-gray-500">
          Ingresado por {registerByText || "Desconocido"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span>{calculateAge(String(patient?.birthDate))} años</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDate(String(patient?.birthDate))}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <span>{formatDni(String(patient?.dni))}</span>
        </div>
        <Separator className="bg-greenPrimary" />
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          {patient?.email ? (
            <span>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </span>
          ) : (
            <p className="text-sm text-gray-500">No tiene email asociado.</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{patient?.phoneNumber}</span>{" "}
        </div>
        <Separator className="bg-greenPrimary" />
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <div className="flex flex-col">
            <span>
              {patient?.address?.city?.state?.name &&
              patient?.address?.city?.name
                ? `${patient.address.city.state.name}, ${patient.address.city.name}`
                : ""}
            </span>
            <span className="text-sm text-gray-500">
              {patient?.address?.street && patient?.address?.number
                ? `${patient.address.street}, ${patient.address.number}`
                : ""}
              {patient?.address?.description
                ? `, ${patient.address.description}`
                : ""}
              {patient?.phoneNumber2 ? ` - ${patient.phoneNumber2}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Droplet className="h-4 w-4 text-gray-500" />
          <div className="flex flex-col">
            <span>{patient?.bloodType}</span>
            <span className="text-sm text-gray-500">{patient?.rhFactor}</span>
          </div>
        </div>
        <Separator className="bg-greenPrimary" />
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-gray-500 mt-1" />
          <p className="text-sm text-gray-500">
            {patient?.observations ?? "Sin observaciones"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full bg-greenPrimary hover:bg-teal-800">
          <Link to={`/pacientes/${patient?.slug}/perfil`}>
            Ver perfil completo
          </Link>
        </Button>
        <ResetDefaultPasswordDialog idUser={Number(patient?.userId)} />
      </CardFooter>
    </Card>
  );
};

export default PatientCardComponent;
