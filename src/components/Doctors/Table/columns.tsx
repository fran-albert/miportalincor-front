import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Doctor } from "@/types/Doctor/Doctor";
import { formatDni, formatMatricula } from "@/common/helpers/helpers";
import { ViewButton } from "@/components/Button/View/button";
import { Link } from "react-router-dom";
import DeleteDoctorDialog from "../Delete/DeleteDoctorDialog";

export const getColumns = (
  prefetchDoctors: (id: number) => void,
  roles: { isSecretary: boolean; isDoctor: boolean; isAdmin: boolean }
): ColumnDef<Doctor>[] => {
  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => {
        const index = row.index;
        return <div>{index + 1}</div>;
      },
    },
    {
      accessorKey: "firstName",
      header: "Médico",
      cell: ({ row }) => (
        <Link
          to={`/medicos/${row.original.slug}`}
          className="flex items-center cursor-pointer"
          onMouseEnter={
            prefetchDoctors && (() => prefetchDoctors(row.original.userId))
          }
        >
          <Avatar>
            <AvatarImage
              src={
                row.original.photo
                  ? `https://incor-ranking.s3.us-east-1.amazonaws.com/storage/avatar/${row.original.photo}`
                  : "https://incor-ranking.s3.us-east-1.amazonaws.com/storage/avatar/default.png"
              }
              alt="@username"
            />
            <AvatarFallback>
              {`${row.original.firstName
                .charAt(0)
                .toLocaleUpperCase()}${row.original.lastName
                .charAt(0)
                .toLocaleUpperCase()}`}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col ml-2">
            {" "}
            <p className="text-sm font-medium">
              {row.original.lastName}, {row.original.firstName}
            </p>
            <span
              style={{ fontSize: "0.75rem" }}
              className="text-teal-800 font-bold"
            >
              {row.original.email}
            </span>{" "}
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "matricula",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">
            {row.original.matricula
              ? formatMatricula(row.original.matricula)
              : "Sin matrícula"}
          </p>
        </div>
      ),
    },
    {
      header: "DNI",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">{formatDni(row.original.dni)}</p>
        </div>
      ),
    },
    // {
    //   accessorKey: "phoneNumber",
    //   header: "Teléfono",
    //   cell: ({ row }) => (
    //     <div className="flex items-center">
    //       <p className="text-sm font-medium">{row.original.phoneNumber}</p>
    //     </div>
    //   ),
    // },
    {
      header: "Especialidades",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">
            {row.original.specialities.slice(0, 1).map((speciality, index) => (
              <span key={index}>
                {speciality.name}
                {index < 1 && row.original.specialities.length > 1 ? "" : ""}
              </span>
            ))}
            {row.original.specialities.length > 1 && "..."}
          </p>
        </div>
      ),
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          {roles.isSecretary || roles.isAdmin && (
            <>
              <ViewButton
                slug={String(row.original.slug)}
                text="Ver Medico"
                path="medicos"
              />
              <DeleteDoctorDialog idDoctor={row.original.userId} />
            </>
          )}
          {roles.isDoctor && (
            <ViewButton
              slug={String(row.original.slug)}
              text="Ver Medico"
              path="medicos"
            />
          )}
        </div>
      ),
    },
  ];
  return columns;
};
