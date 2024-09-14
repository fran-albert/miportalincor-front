import { ColumnDef } from "@tanstack/react-table";
// import DeleteSpecialityDialog from "../delete/DeleteSpecialityDialog";
// import EditSpecialityDialog from "../edit/EditSpecialityDialog";
// import { EditButtonIcon } from "@/components/Button/Edit/button";
import { Speciality } from "@/types/Speciality/Speciality";
import { EditButtonIcon } from "@/components/Button/Edit/button";

export const getColumns = (
  isDoctor: boolean,
  onEditSpeciality: (speciality: Speciality) => void
): ColumnDef<Speciality>[] => {
  const columns: ColumnDef<Speciality>[] = [
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
      header: "Especialidad",
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {!isDoctor && (
            <>
              <EditButtonIcon
                onClick={() => onEditSpeciality(row.original)}
                className="mr-2"
              />
              {/* <DeleteSpecialityDialog speciality={row.original} /> */}
            </>
          )}
        </div>
      ),
    },
  ];

  return columns;
};
