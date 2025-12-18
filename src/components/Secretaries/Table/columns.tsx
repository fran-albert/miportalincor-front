import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Secretary } from "@/types/Secretary/Secretary";
import { formatDni } from "@/common/helpers/helpers";
import { Badge } from "@/components/ui/badge";
import DeleteSecretaryDialog from "../Delete/DeleteSecretaryDialog";
import ReactivateSecretaryDialog from "../Reactivate/ReactivateSecretaryDialog";

export const getColumns = (): ColumnDef<Secretary>[] => {
  const columns: ColumnDef<Secretary>[] = [
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
      header: "Secretaria",
      cell: ({ row }) => (
        <div className="flex items-center">
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
            <p className="text-sm font-medium">
              {row.original.lastName}, {row.original.firstName}
            </p>
            <span
              style={{ fontSize: "0.75rem" }}
              className="text-teal-800 font-bold"
            >
              {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "DNI",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">
            {formatDni(row.original.dni || row.original.userName)}
          </p>
        </div>
      ),
    },
    {
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p className="text-sm font-medium">{row.original.phoneNumber || "-"}</p>
        </div>
      ),
    },
    {
      header: "Estado",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.active ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Activa
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
              Inactiva
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {row.original.active ? (
            <DeleteSecretaryDialog idSecretary={row.original.id} />
          ) : (
            <ReactivateSecretaryDialog idSecretary={row.original.id} />
          )}
        </div>
      ),
    },
  ];
  return columns;
};
