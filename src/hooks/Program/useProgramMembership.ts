import { useMemo } from "react";
import useRoles from "@/hooks/useRoles";
import { useProgramMembers } from "@/hooks/Program/useProgramMembers";
import { MemberRole } from "@/types/Program/ProgramMember";

export const useProgramMembership = (programId: string) => {
  const { session, isAdmin } = useRoles();
  const membersState = useProgramMembers(programId);

  const currentMember = useMemo(
    () =>
      membersState.members.find((member) => member.userId === session?.id) ?? null,
    [membersState.members, session?.id]
  );

  return {
    ...membersState,
    currentMember,
    isAdmin,
    isProgramMember: Boolean(currentMember),
    isCoordinator: currentMember?.role === MemberRole.COORDINATOR,
  };
};
