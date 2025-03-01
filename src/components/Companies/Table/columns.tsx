import { ColumnDef } from "@tanstack/react-table";
import { formatCuilCuit } from "@/common/helpers/helpers";
import { ViewButton } from "@/components/Button/View/button";
import { Link } from "react-router-dom";
import { Company } from "@/types/Company/Company";

export const getColumns = (roles: {
  isSecretary: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
}): ColumnDef<Company>[] => {
  const columns: ColumnDef<Company>[] = [
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
          to={`/incor-laboral/empresas/${row.original.id}`}
          className="flex items-center cursor-pointer"
        >
          <div className="flex flex-col ml-2">
            <p className="text-sm font-medium">{row.original.name}</p>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: " ",
      header: "CUIT - CUIL",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">
            {formatCuilCuit(row.original.taxId)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email Asociado",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">{row.original.email}</p>
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
              slug={`${row.original.id}`}
              text="Ver Empresa"
              path="incor-laboral/empresas"
            />
          )}
          {/* {(roles.isSecretary || roles.isAdmin) && (
            <DeleteCollaboratorDialog id={row.original.id} />
          )} */}
        </div>
      ),
    },
  ];

  return columns;
};
