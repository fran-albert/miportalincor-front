import { Building2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function LaboralIncorComponent() {
  return (
    <div className="container mx-auto px-4 py-12 ">
      <h1 className="text-4xl font-bold text-center mb-6 text-greenPrimary">
        Bienvenido a Incor Laboral
      </h1>
      <h2 className="text-2xl font-semibold text-center mb-10 text-muted-foreground">
        ¿Qué desea gestionar?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <Link to={"/incor-laboral/empresas"}>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <Building2 className="w-24 h-24 mb-6 text-greenPrimary" />
              <h3 className="text-2xl font-semibold">EMPRESAS</h3>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          <Link to={"/incor-laboral/colaboradores"}>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <Users className="w-24 h-24 mb-6 text-greenPrimary" />
              <h3 className="text-2xl font-semibold">COLABORADORES</h3>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
