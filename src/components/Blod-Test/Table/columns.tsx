import { ColumnDef } from "@tanstack/react-table";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { EditButtonIcon } from "@/components/Button/Edit/button";
import DeleteBlodTestDialog from "../Delete";

export const getColumns = (
  onEditBlodTest: (blodTest: BloodTest) => void,
  roles: { isAdmin: boolean }
): ColumnDef<BloodTest>[] => {
  const columns: ColumnDef<BloodTest>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => {
        const index = row.index;
        return <div>{index + 1}</div>;
      },
    },
    {
      accessorKey: "originalName",
      header: "Análisis Bioquímico",
      cell: ({ row }) => <div>{row.original.originalName}</div>,
    },
    {
      accessorKey: "referenceValue",
      header: "Rango de Referencia",
      cell: ({ row }) => <div>{row.original.referenceValue}</div>,
    },
    {
      accessorKey: "unit",
      header: "Unidad",
      cell: ({ row }) => (
        <div>
          {" "}
          {row.original.unit?.name} - {row.original.unit?.shortName}
        </div>
      ),
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {roles.isAdmin && (
            <>
              <EditButtonIcon onClick={() => onEditBlodTest(row.original)} />
              <DeleteBlodTestDialog blodTest={row.original} />
            </>
          )}
        </div>
      ),
    },
  ];

  return columns;
};
