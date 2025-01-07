import { ColumnDef } from "@tanstack/react-table";
import { EditButtonIcon } from "@/components/Button/Edit/button";
import { StudyType } from "@/types/Study-Type/Study-Type";
import DeleteStudyTypeDialog from "../Delete";

export const getColumns = (
  isDoctor: boolean,
  onEditStudyType: (studyType: StudyType) => void
): ColumnDef<StudyType>[] => {
  const columns: ColumnDef<StudyType>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => {
        const index = row.index;
        return <div>{index + 1}</div>;
      },
    },
    {
      accessorKey: "name",
      header: "Tipo de Estudio",
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {!isDoctor && (
            <>
              <EditButtonIcon onClick={() => onEditStudyType(row.original)} />
              <DeleteStudyTypeDialog studyType={row.original} />
            </>
          )}
        </div>
      ),
    },
  ];

  return columns;
};
