import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export default function PatientHomePage({ name }: { name: string }) {
  return (
    <div className="w-full bg-background">
      <section className="container mx-auto py-12 px-4 md:py-16 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter text-greenPrimary sm:text-4xl md:text-5xl">
              ¡Bienvenido {name} a Mi Portal!
            </h1>
            <p className="text-muted-foreground md:text-xl text-justify">
              Acá podrás acceder a toda la información sobre tu bienestar y
              salud de manera segura y confidencial.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div>
                  <UserIcon className="h-8 w-8 text-greenPrimary" />
                  <h3 className="mt-2 text-lg font-medium">
                    Editar datos personales
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Mantén tus datos actualizados.
                  </p>
                </div>
                <Button variant="link" size="sm">
                  <Link to={"/mi-perfil"}>Ir a Perfil</Link>
                </Button>
              </Card>
              <Card className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div>
                  <FileTextIcon className="h-8 w-8 text-greenPrimary" />
                  <h3 className="mt-2 text-lg font-medium">
                    Ver resultados de Estudios
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Consulta tus estudios realizados.
                  </p>
                </div>
                <Button variant="link" size="sm">
                  <Link to={"/mis-estudios"}>Ver</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
