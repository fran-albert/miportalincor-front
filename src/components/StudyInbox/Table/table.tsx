import { useState } from "react";
import { Inbox } from "lucide-react";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudyInbox } from "@/hooks/StudyInbox/useStudyInbox";
import { StudyInboxItem, StudyInboxStatus } from "@/types/StudyInbox/StudyInbox.types";
import { getColumns } from "./columns";
import { ReviewDialog } from "../Dialogs/ReviewDialog";
import { UploadPdfButton } from "../UploadPdfButton";

const TABS: { value: StudyInboxStatus; label: string }[] = [
  { value: "LISTO_PARA_CONFIRMAR", label: "Para confirmar" },
  { value: "REQUIERE_REVISION", label: "Para revisar" },
  { value: "DUPLICADO", label: "Duplicados" },
  { value: "CARGADO", label: "Cargados" },
  { value: "DESCARTADO", label: "Descartados" },
];

export const StudyInboxScreen = () => {
  const [status, setStatus] = useState<StudyInboxStatus>("LISTO_PARA_CONFIRMAR");
  const [activeItem, setActiveItem] = useState<StudyInboxItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { items, isFetching, search, setSearch, page, totalPages, nextPage, prevPage } =
    useStudyInbox({ status, initialLimit: 10 });

  const columns = getColumns({
    onReview: (item) => {
      setActiveItem(item);
      setDialogOpen(true);
    },
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Estudios recibidos" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Estudios recibidos"
        description="Revisá los laboratorios recibidos por email y confirmá la carga al paciente."
        icon={<Inbox className="h-6 w-6" />}
        actions={<UploadPdfButton />}
      />

      <Tabs value={status} onValueChange={(v) => setStatus(v as StudyInboxStatus)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Buscar por paciente..."
          showSearch={true}
          searchQuery={search}
          setSearch={setSearch}
          useServerSideSearch={true}
          showDataOnEmptySearch={true}
          canAddUser={false}
          isFetching={isFetching}
          currentPage={page}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </div>

      <ReviewDialog
        item={activeItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};
