import { ColumnDef } from "@tanstack/react-table";
import { formatDni } from "@/common/helpers/helpers";
import { ViewButton } from "@/components/Button/View/button";
import { Link } from "react-router-dom";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import DeleteCollaboratorDialog from "../Delete";

export const getColumns = (roles: {
  isSecretary: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
}): ColumnDef<Collaborator>[] => {
  const columns: ColumnDef<Collaborator>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => {
        const index = row.index;
        return <div className="text-sm">{index + 1}</div>;
      },
    },
    {
      accessorKey: "firstName",
      header: "Colaborador",
      cell: ({ row }) => (
        <Link
          to={`/incor-laboral/colaboradores/${row.original.slug}`}
          className="flex items-center cursor-pointer"
          // onMouseEnter={() =>
          //   prefetchPatients && prefetchPatients(row.original.id)
          // }
        >
          <div className="flex flex-col ml-2">
            <p className="text-sm font-medium">
              {row.original.lastName}, {row.original.firstName}
            </p>
            <span
              style={{ fontSize: "0.75rem" }}
              className="text-gray-900 font-bold"
            >
              {row.original.email && row.original.email !== "undefined"
                ? row.original.email
                : ""}
            </span>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "dni",
      header: "D.N.I.",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">
            {formatDni(row.original.userName)}
          </p>
        </div>
      ),
    },
    {
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">{row.original.phone}</p>
        </div>
      ),
    },

    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {(roles.isSecretary || roles.isDoctor || roles.isAdmin) && (
            <ViewButton
              slug={`${row.original.slug}`}
              text="Ver Colaborador"
              path="incor-laboral/colaboradores"
            />
          )}
          {(roles.isSecretary || roles.isAdmin) && (
            <DeleteCollaboratorDialog id={row.original.id} />
          )}
        </div>
      ),
    },
  ];

  return columns;
};
