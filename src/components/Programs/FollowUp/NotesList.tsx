import { ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FollowUpVisibilityLabels,
  ProgramFollowUpEntry,
} from "@/types/Program/ProgramFollowUp";

interface NotesListProps {
  entries: ProgramFollowUpEntry[];
  emptyMessage: string;
  renderActions?: (entry: ProgramFollowUpEntry) => ReactNode;
  variant?: "staff" | "patient";
}

const getAuthorName = (entry: ProgramFollowUpEntry) => {
  const fullName = [entry.authorFirstName, entry.authorLastName]
    .filter(Boolean)
    .join(" ");

  return fullName || entry.authorUserId;
};

const getEntryDate = (entry: ProgramFollowUpEntry) => {
  if (!entry.createdAt) {
    return "Fecha no disponible";
  }

  return format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", {
    locale: es,
  });
};

export function NotesList({
  entries,
  emptyMessage,
  renderActions,
  variant = "staff",
}: NotesListProps) {
  if (entries.length === 0) {
    return (
      <Card className={cn(variant === "patient" ? "border-0 shadow-md" : "border-dashed shadow-none")}>
        <CardContent className="py-10 text-center">
          <div className="mx-auto max-w-xl space-y-2">
            <p className="text-base font-semibold text-slate-900">
              Todavía no hay novedades para mostrar.
            </p>
            <p className="text-sm leading-6 text-slate-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "patient") {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="divide-y divide-slate-100 p-5">
          {entries.map((entry) => (
            <div key={entry.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {getEntryDate(entry)}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {entry.title || "Nota del equipo"}
                </h3>
                <p className="text-sm text-slate-500">{getAuthorName(entry)}</p>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {entry.content || "Sin contenido."}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <article key={entry.id} className="relative pl-7">
          {index < entries.length - 1 && (
            <span className="absolute left-[7px] top-6 h-[calc(100%-0.25rem)] w-px bg-slate-200" />
          )}
          <span
            className="absolute left-0 top-2.5 h-4 w-4 rounded-full border-4 border-white bg-slate-700 shadow-sm"
          />

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {getEntryDate(entry)}
                    </span>
                    {variant === "staff" && (
                      <Badge variant="outline" className="border-slate-200 bg-slate-50">
                        {FollowUpVisibilityLabels[entry.visibility]}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {entry.title || "Observación del equipo"}
                    </h3>
                    <p className="text-sm text-slate-500">{getAuthorName(entry)}</p>
                  </div>
                </div>
                {renderActions?.(entry)}
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {entry.content || "Sin contenido."}
                </p>
              </div>
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}
