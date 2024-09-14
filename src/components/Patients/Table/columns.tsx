import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDni } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { ViewButton } from "@/components/Button/View/button";
import { Link } from "react-router-dom";
import DeletePatientDialog from "../Delete/DeletePatientDialog";

export const getColumns = (
  prefetchPatients: (id: number) => void,
  roles: { isSecretary: boolean; isDoctor: boolean }
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
          <Avatar>
            <AvatarImage
              src={
                row.original.photo
                  ? `https://incor-healthcare.s3.us-east-1.amazonaws.com/photos/${row.original.photo}`
                  : "https://incor-ranking.s3.us-east-1.amazonaws.com/storage/avatar/default.png"
              }
              alt="@username"
            />
            <AvatarFallback>
              {`${row.original.firstName.charAt(
                0
              )}${row.original.lastName.charAt(0)}`}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-2">
            <p className="text-sm font-medium">
              {row.original.lastName}, {row.original.firstName}
            </p>
            <span
              style={{ fontSize: "0.75rem" }}
              className="text-gray-800 font-bold"
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
          <p className="text-sm font-medium">{formatDni(row.original.dni)}</p>
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
          {(roles.isSecretary || roles.isDoctor) && (
            <ViewButton
              slug={String(row.original.slug)}
              text="Ver Paciente"
              path="pacientes"
            />
          )}
          {roles.isSecretary && (
            <DeletePatientDialog idPatient={row.original.userId} />
          )}
        </div>
      ),
    },
  ];

  return columns;
};
