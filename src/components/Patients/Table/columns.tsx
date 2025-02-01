import { ColumnDef } from "@tanstack/react-table";
import { formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { ViewButton } from "@/components/Button/View/button";
import { Link } from "react-router-dom";
import DeletePatientDialog from "../Delete/DeletePatientDialog";

export const getColumns = (
  prefetchPatients: (id: number) => void,
  roles: { isSecretary: boolean; isDoctor: boolean; isAdmin: boolean }
): ColumnDef<Patient>[] => {
  const columns: ColumnDef<Patient>[] = [
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
      header: "Paciente",
      cell: ({ row }) => (
        <Link
          to={`/pacientes/${row.original.slug}`}
          className="flex items-center cursor-pointer"
          onMouseEnter={() =>
            prefetchPatients && prefetchPatients(row.original.userId)
          }
        >
          <div className="flex flex-col ml-2">
            <p className="text-sm font-medium">
              {row.original.lastName}, {row.original.firstName}
            </p>
            <span
              style={{ fontSize: "0.75rem" }}
              className="text-gray-900 font-bold"
            >
              {row.original.email}
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
          <p className="text-sm font-medium">{formatDni(row.original.userName)}</p>
        </div>
      ),
    },
    {
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">{row.original.phoneNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "healthPlans",
      header: "Obra Social",
      cell: ({ row }) => {
        const firstHealthPlan =
          row.original.healthPlans?.map((healthPlan) => healthPlan.name)[0] ||
          "Sin Obra Social";
        return (
          <div className="flex items-center">
            <p className="text-sm font-medium">{firstHealthPlan}</p>
          </div>
        );
      },
    },

    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {(roles.isSecretary || roles.isDoctor || roles.isAdmin) && (
            <ViewButton
              slug={String(row.original.slug)}
              text="Ver Paciente"
              path="pacientes"
            />
          )}
          {(roles.isSecretary || roles.isAdmin) && (
            <DeletePatientDialog idPatient={row.original.userId} />
          )}
        </div>
      ),
    },
  ];

  return columns;
};
