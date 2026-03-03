import { ColumnDef } from "@tanstack/react-table";
import { ProgramMember, MemberRoleLabels } from "@/types/Program/ProgramMember";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const getMemberColumns = (
  isAdmin: boolean,
  onRemove: (memberId: string) => void
): ColumnDef<ProgramMember>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "user",
    header: "Miembro",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div>
          <div className="font-medium">
            {user ? `${user.firstName} ${user.lastName}` : row.original.userId}
          </div>
          {user?.email && (
            <div className="text-sm text-gray-500">{user.email}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => (
      <Badge variant="outline">
        {MemberRoleLabels[row.original.role]}
      </Badge>
    ),
  },
  {
    header: " ",
    cell: ({ row }) =>
      isAdmin ? (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : null,
  },
];
