import { useMemo } from "react";
import useRoles from "@/hooks/useRoles";
import { useProgramMembers } from "@/hooks/Program/useProgramMembers";
import { MemberRole } from "@/types/Program/ProgramMember";
import { getProgramAccessCapabilities } from "@/common/helpers/programAccess";

export const useProgramMembership = (programId: string) => {
  const { session, isAdmin, isSecretary, isDoctor } = useRoles();
  const membersState = useProgramMembers(programId);

  const currentMember = useMemo(
    () =>
      membersState.members.find((member) => member.userId === session?.id) ?? null,
    [membersState.members, session?.id]
  );

  const isProgramMember = Boolean(currentMember);
  const isCoordinator = currentMember?.role === MemberRole.COORDINATOR;
  const capabilities = getProgramAccessCapabilities({
    isAdmin,
    isSecretary,
    isDoctor,
    isProgramMember,
    isCoordinator,
  });

  return {
    ...membersState,
    currentMember,
    isAdmin,
    isSecretary,
    isDoctor,
    isProgramMember,
    isCoordinator,
    ...capabilities,
  };
};
