import { ColumnDef } from "@tanstack/react-table";
// import DeleteHealthInsuranceDialog from "../delete/DeleteHealthCareDialog";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { EditButtonIcon } from "@/components/Button/Edit/button";
import DeleteHealthInsuranceDialog from "../Delete";

export const getColumns = (
  isDoctor: boolean,
  onEditHealthCare: (healthCare: HealthInsurance) => void
): ColumnDef<HealthInsurance>[] => {
  const columns: ColumnDef<HealthInsurance>[] = [
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
      header: "Obra Social",
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {!isDoctor && (
            <>
              <EditButtonIcon onClick={() => onEditHealthCare(row.original)} />
              <DeleteHealthInsuranceDialog healthInsurance={row.original} />
            </>
          )}
        </div>
      ),
    },
  ];

  return columns;
};
