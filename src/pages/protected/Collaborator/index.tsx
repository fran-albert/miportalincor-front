import { Helmet } from "react-helmet-async";
import { useCollaboratorMedicalEvaluation } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluation";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { useParams } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import LoadingAnimation from "@/components/Loading/loading";
import { useEvaluationType } from "@/hooks/Evaluation-Type/useEvaluationTypes";
import { ListPreoccupationalExamsTable } from "@/components/Pre-Occupational/List/Table/table";
import CollaboratorInformationCard from "@/components/Pre-Occupational/Collaborator-Information";
import useRoles from "@/hooks/useRoles";
import { FileText, Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import CreateCollaboratorEvolution from "@/components/Collaborators/Evolution/Create";
import CollaboratorListEvolution from "@/components/Collaborators/Evolution/List";
import { useEvolutions } from "@/hooks/Evolutions/useEvolutions";

// const medicationsData = [
//   {
//     id: 1,
//     name: "Ibuprofeno",
//     dose: "400mg",
//     frequency: "Cada 8 horas",
//     startDate: "2024-02-28",
//     status: "Activo",
//     indication: "Dolor lumbar",
//   },
//   {
//     id: 2,
//     name: "Vitamina D",
//     dose: "1000 UI",
//     frequency: "Diario",
//     startDate: "2024-01-15",
//     status: "Activo",
//     indication: "Suplementación",
//   },
//   {
//     id: 3,
//     name: "Omeprazol",
//     dose: "20mg",
//     frequency: "En ayunas",
//     startDate: "2024-01-10",
//     status: "Suspendido",
//     indication: "Gastritis",
//   },
// ];
const CollaboratorPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id, formattedName } = parseSlug(slug);
  const { isSecretary, isAdmin, session } = useRoles();
  const canEdit = isSecretary || isAdmin;
  const { collaborator, isLoading } = useCollaborator({
    auth: true,
    id,
  });

  const [evolutionView, setEvolutionView] = useState<"menu" | "list" | "new">(
    "menu"
  );
  const { evolutions } = useEvolutions({
    collaboratorId: id,
    enabled: !!id && (evolutionView === "list" || evolutionView === "new"),
  });
  const {
    evaluationTypes: allEvaluationTypes,
    isLoading: isLoadingEvaluationTypes,
  } = useEvaluationType({ auth: true });
  const allowedEvaluationTypes = [
    "Preocupacional",
    "Periódico",
    "Salida (Retiro)",
    "Cambio de Puesto",
    "Libreta Sanitaria",
    "Otro",
  ];

  const evaluationTypes = allEvaluationTypes.filter((type) =>
    allowedEvaluationTypes.includes(type.name)
  );

  const { data, isFetching } = id
    ? useCollaboratorMedicalEvaluation({ id, auth: true })
    : { data: undefined, isFetching: false };
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: `/incor-laboral/colaboradores` },
    { label: formattedName, href: `/incor-laboral/colaboradores/${slug}` },
  ];
  if (isLoading || isLoadingEvaluationTypes) {
    return <LoadingAnimation />;
  }
  return (
    <>
      <Helmet>
        <title>Incor Laboral</title>
      </Helmet>
      <div className="space-y-2 mt-2">
        <BreadcrumbComponent items={breadcrumbItems} />
        <div className="container mx-auto p-6 space-y-6">
          <CollaboratorInformationCard
            collaborator={collaborator}
            canEdit={canEdit}
          />

          {/* Pestañas */}
          <Tabs defaultValue="examenes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="examenes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                EXAMENES
              </TabsTrigger>
              <TabsTrigger
                value="evoluciones"
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                EVOLUCIONES
              </TabsTrigger>
              {/* <TabsTrigger
                value="medicacion"
                className="flex items-center gap-2"
              >
                <Pill className="h-4 w-4" />
                MEDICACION ACTUAL
              </TabsTrigger> */}
            </TabsList>

            {/* Pestaña de Exámenes */}
            <TabsContent value="examenes" className="space-y-4">
              <ListPreoccupationalExamsTable
                data={data || []}
                isFetching={isFetching}
                evaluationTypes={evaluationTypes}
                slug={slug}
                collaborator={collaborator}
              />
            </TabsContent>

            {/* Pestaña de Evoluciones */}
            <TabsContent value="evoluciones" className="space-y-4">
              {evolutionView === "menu" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      onClick={() => setEvolutionView("list")}
                      className="min-w-[200px] bg-greenPrimary text-white hover:bg-teal-600"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Ver Evoluciones
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setEvolutionView("new")}
                      className="min-w-[200px]"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Nueva Evolución
                    </Button>
                  </div>
                </div>
              )}

              {evolutionView === "list" && (
                <CollaboratorListEvolution
                  setEvolutionView={setEvolutionView}
                  evolutions={evolutions || []}
                />
              )}

              {evolutionView === "new" && (
                <CreateCollaboratorEvolution
                  setEvolutionView={setEvolutionView}
                  companyEmail={collaborator.company.email}
                  doctorId={Number(session?.id)}
                  collaboratorId={id}
                />
              )}
            </TabsContent>

            {/* Pestaña de Medicación Actual */}
            {/* <TabsContent value="medicacion" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medicación Actual</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Medicación
                </Button>
              </div>

              <div className="grid gap-4"></div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {
                          medicationsData.filter((m) => m.status === "Activo")
                            .length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Medicamentos Activos
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-500">
                        {
                          medicationsData.filter(
                            (m) => m.status === "Suspendido"
                          ).length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Medicamentos Suspendidos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CollaboratorPage;
