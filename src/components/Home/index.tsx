import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaUsers } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { GiHospitalCross, GiHypodermicTest } from "react-icons/gi";
import { MdHealthAndSafety } from "react-icons/md";
import { Link } from "react-router-dom";
import { CiMedicalClipboard } from "react-icons/ci";

export default function HomeComponent({ name }: { name: string }) {
  const cards = [
    {
      title: "Pacientes",
      description:
        "Ingrese al módulo de pacientes para ver la lista de pacientes.",
      icon: <FaUsers className="h-8 w-8 text-greenPrimary" />,
      href: "/pacientes",
    },
    {
      title: "Médicos",
      description: "Ingrese al módulo de médicos para ver la lista de médicos.",
      icon: <FaUserDoctor className="h-8 w-8 text-greenPrimary" />,
      href: "/medicos",
    },
    {
      title: "Especialidades",
      description:
        "Ingrese al módulo de especialidades para ver la lista de especialidades.",
      icon: <GiHospitalCross className="h-8 w-8 text-greenPrimary" />,
      href: "/especialidades",
    },
    {
      title: "Obras Sociales",
      description:
        "Ingrese al módulo de obras sociales para ver la lista de obras sociales.",
      icon: <MdHealthAndSafety className="h-8 w-8 text-greenPrimary" />,
      href: "/obras-sociales",
    },
    {
      title: "Laboratorios",
      description:
        "Ingrese al módulo de laboratorios para ver la lista de laboratorios.",
      icon: <GiHypodermicTest className="h-8 w-8 text-greenPrimary" />,
      href: "/analisis-bioquimicos",
    },
    {
      title: "Tipos de Estudios",
      description:
        "Ingrese al módulo de tipos de estudios para ver la lista de tipos de estudios.",
      icon: <CiMedicalClipboard className="h-8 w-8 text-greenPrimary" />,
      href: "/tipos-de-estudios",
    },
    {
      title: "Incor Laboral - Colaboradores",
      description:
        "Ingrese al módulo de Incor Laboral.",
      icon: <FaUsers className="h-8 w-8 text-greenPrimary" />,
      href: "/incor-laboral",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-greenPrimary">
        Hola, {name}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className="flex flex-col items-center text-center transition duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer h-full"
          >
            <Link to={card.href}>
              <CardHeader>
                <div className="rounded-full bg-primary-50 p-3 mb-4 mx-auto">
                  {card.icon}
                </div>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
