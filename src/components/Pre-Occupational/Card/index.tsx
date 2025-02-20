import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ExternalLink } from "lucide-react";
import CollaboratorInformationCard from "../Collaborator-Information";
import NavigationTabs from "@/components/Tabs/Pre-Occupational/Navigation-Tabs";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Props {
  slug: string;
}

export default function PreOccupationalCards({ slug }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Fecha</div>
                <div className="font-semibold">
                  {new Date().toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Descripción</div>
                <div className="font-semibold">PRE-OCUPACIONAL</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/incor-laboral/colaboradores/${slug}/previsualizar-informe`
                  )
                } // Redirige a la previsualización
              >
                <Eye className="mr-2 h-4 w-4" />
                Previsualizar informe
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir en otra pestaña
              </Button>
            </div>
          </CardContent>
        </Card>
        <CollaboratorInformationCard />
        <NavigationTabs isEditing={isEditing} setIsEditing={setIsEditing} />
      </div>
    </div>
  );
}
