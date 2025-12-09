import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Doctor } from "@/types/Doctor/Doctor";
import {
  calculateAge,
  formatDate,
  formatDateWithTime,
  formatDni,
} from "@/common/helpers/helpers";
import ResetDefaultPasswordDialog from "@/components/Button/Reset-Default-Password";
import {
  Calendar,
  CreditCard,
  Droplet,
  Info,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useUserRole from "@/hooks/useRoles";
const DoctorCardComponent = ({ doctor }: { doctor: Doctor | null }) => {
  const { isSecretary, isAdmin, isDoctor } = useUserRole();
  const registerByText =
    doctor?.registeredByName +
    " " +
    "- " +
    formatDateWithTime(String(doctor?.registrationDate));
  return (
    <Card className="w-full max-w-sm border-2">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-bold text-greenPrimary">
          {doctor?.firstName} {doctor?.lastName}
        </h2>
        {doctor?.specialities.map((speciality) => (
          <p className="text-sm font-bold text-greenPrimary">
            <span>{speciality.name}</span>
          </p>
        ))}
        <p className="text-sm text-gray-500">
          Ingresado por {registerByText || "Desconocido"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span>{calculateAge(String(doctor?.birthDate))} años</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDate(String(doctor?.birthDate))}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <span>{formatDni(String(doctor?.dni))}</span>
        </div>
        <Separator className="bg-greenPrimary" />
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          {doctor?.email ? (
            <span>
              <p className="text-sm text-gray-500">{doctor.email}</p>
            </span>
          ) : (
            <p className="text-sm text-gray-500">No tiene email asociado.</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{doctor?.phoneNumber}</span>{" "}
        </div>
        <Separator className="bg-greenPrimary" />
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <div className="flex flex-col">
            <span>
              {doctor?.address?.city?.state?.name && doctor?.address?.city?.name
                ? `${doctor.address.city.state.name}, ${doctor.address.city.name}`
                : ""}
            </span>
            <span className="text-sm text-gray-500">
              {doctor?.address?.street && doctor?.address?.number
                ? `${doctor.address.street}, ${doctor.address.number}`
                : ""}
              {doctor?.address?.description
                ? `, ${doctor.address.description}`
                : ""}
              {doctor?.phoneNumber2 ? ` - ${doctor.phoneNumber2}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Droplet className="h-4 w-4 text-gray-500" />
          <div className="flex flex-col">
            <span>
              {doctor?.bloodType && doctor?.rhFactor
                ? `${doctor.bloodType} ${doctor.rhFactor}`
                : "No especificado"}
            </span>
          </div>
        </div>
        <Separator className="bg-greenPrimary" />
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-gray-500 mt-1" />
          <p className="text-sm text-gray-500">
            {doctor?.observations ?? "Sin observaciones"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full bg-greenPrimary hover:bg-teal-800">
          <Link to={`/medicos/${doctor?.slug}/perfil`}>
            Ver perfil completo
          </Link>
        </Button>
        {(isSecretary || isAdmin) && (doctor?.userName || doctor?.dni) && (
          <ResetDefaultPasswordDialog userName={doctor?.userName || doctor?.dni || ''} />
        )}
        {isDoctor && (
          <Button className="w-full text-greenPrimary" variant={"link"}>
            <Link to={`/medicos/${doctor?.slug}/control-nutricional`}>
              Control Nutricional
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
    // <Card>
    //   <CardHeader>
    //     <div className="space-y-1">
    //       <CardTitle className="text-incor">
    //         {doctor?.gender === "Masculino" ? "Dr. " : "Dra. "}{" "}
    //         {doctor?.firstName} {doctor?.lastName}
    //       </CardTitle>
    //       <CardDescription>
    //         Creado por {registerByText || "Desconocido"}
    //       </CardDescription>
    //       {isSecretary && (
    //         <div className="flex justify-center gap-4">
    //           <div className="text-gray-600 hover:text-gray-800">
    //             <EditButtonIcon
    //               slug={doctor?.slug}
    //               id={doctor?.id}
    //               props={{ variant: "outline" }}
    //               path="usuarios/medicos"
    //             />
    //           </div>
    //           <div className="text-gray-600 hover:text-gray-800">
    //             <ResetDefaultPasswordDialog idUser={Number(doctor?.userId)} />
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </CardHeader>
    //   <CardContent className="space-y-4">
    //     <div className="grid gap-2">
    //       <div className="flex items-center gap-2">
    //         <FaUser className="h-5 w-5 text-teal-500" />
    //         <span>{calculateAge(String(doctor?.birthDate))} años</span>
    //       </div>
    //       <div className="flex items-center gap-2">
    //         {doctor?.gender === "Masculino" ? (
    //           <>
    //             <FaMars className="h-5 w-5 text-blue-500 dark:text-blue-400" />
    //             <span>{doctor?.gender}</span>
    //           </>
    //         ) : (
    //           <>
    //             <FaVenus className="h-5 w-5 text-pink-500 dark:text-pink-400" />
    //             <span>{doctor?.gender}</span>
    //           </>
    //         )}
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <FaLocationDot className="h-5 w-5 text-red-500" />
    //         <span>
    //           {doctor?.address?.street && doctor?.address?.number
    //             ? `${doctor.address.street}, ${doctor.address.number} -`
    //             : ""}
    //           {doctor?.address?.city?.name}, {doctor?.address?.city?.state.name}
    //         </span>
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <FaPhoneAlt className="h-5 w-5 text-orange-500" />
    //         <span>{doctor?.phoneNumber}</span>
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <CiMail className="h-5 w-5 text-gray-500" />
    //         <span>{doctor?.email}</span>
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <FaIdCard className="h-5 w-5 text-cyan-500" />
    //         <span>{formatDni(String(doctor?.dni))}</span>
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <MdDateRange className="h-5 w-5 text-blue-500" />
    //         <span>{formatDate(String(doctor?.birthDate))}</span>
    //       </div>
    //     </div>
    //   </CardContent>
    // </Card>
  );
};

export default DoctorCardComponent;
