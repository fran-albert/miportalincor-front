import { ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FollowUpVisibilityLabels,
  ProgramFollowUpEntry,
} from "@/types/Program/ProgramFollowUp";

interface NotesListProps {
  entries: ProgramFollowUpEntry[];
  emptyMessage: string;
  renderActions?: (entry: ProgramFollowUpEntry) => ReactNode;
}

const getAuthorName = (entry: ProgramFollowUpEntry) => {
  const fullName = [entry.authorFirstName, entry.authorLastName]
    .filter(Boolean)
    .join(" ");

  return fullName || entry.authorUserId;
};

export function NotesList({
  entries,
  emptyMessage,
  renderActions,
}: NotesListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {entry.title || "Observación"}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {getAuthorName(entry)}
                  {entry.createdAt && (
                    <>
                      {" · "}
                      {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {FollowUpVisibilityLabels[entry.visibility]}
                </Badge>
                {renderActions?.(entry)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {entry.content || "Sin contenido."}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
