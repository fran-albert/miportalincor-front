import { ColumnDef } from "@tanstack/react-table";
import { ProgramMember, MemberRoleLabels } from "@/types/Program/ProgramMember";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const getMemberColumns = (
  canManageMembers: boolean,
  onRemove: (memberId: string) => void
): ColumnDef<ProgramMember>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "firstName",
    header: "Miembro",
    cell: ({ row }) => {
      const { firstName, lastName, email, userId } = row.original;
      return (
        <div>
          <div className="font-medium">
            {firstName ? `${firstName} ${lastName}` : userId}
          </div>
          {email && (
            <div className="text-sm text-gray-500">{email}</div>
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
      canManageMembers ? (
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
