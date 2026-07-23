import { describe, expect, it } from "vitest";
import { Role } from "@/common/enums/role.enum";
import { PERMISSIONS } from "@/common/constants/permissions";
import { getProgramAccessCapabilities } from "./programAccess";

describe("getProgramAccessCapabilities", () => {
  it.each([
    ["Secretaria", false, true, false],
    ["Administrador", true, false, true],
  ])(
    "da acceso operativo sin acceso clínico a %s",
    (_role, isAdmin, isSecretary, expectedCanManageActivities) => {
      const capabilities = getProgramAccessCapabilities({
        isAdmin,
        isSecretary,
        isProgramMember: false,
        isCoordinator: false,
      });

      expect(capabilities).toEqual({
        isProgramOperator: true,
        hasClinicalProgramAccess: false,
        canManageEnrollments: true,
        canRegisterAttendance: true,
        canCreateNotes: false,
        canManageActivities: expectedCanManageActivities,
      });
    }
  );

  it("permite al Administrador gestionar actividades aunque también sea coordinador", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: true,
      isSecretary: false,
      isProgramMember: true,
      isCoordinator: true,
    });

    expect(capabilities.canManageActivities).toBe(true);
  });

  it("mantiene el límite no clínico aunque el operador figure como miembro", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: true,
      isProgramMember: true,
      isCoordinator: true,
    });

    expect(capabilities.hasClinicalProgramAccess).toBe(false);
    expect(capabilities.canCreateNotes).toBe(false);
    expect(capabilities.canManageActivities).toBe(false);
  });

  it("conserva las capacidades clínicas actuales del coordinador", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: false,
      isProgramMember: true,
      isCoordinator: true,
    });

    expect(capabilities.hasClinicalProgramAccess).toBe(true);
    expect(capabilities.canManageEnrollments).toBe(true);
    expect(capabilities.canRegisterAttendance).toBe(true);
    expect(capabilities.canCreateNotes).toBe(true);
    expect(capabilities.canManageActivities).toBe(true);
  });

  it("mantiene al profesional como miembro clínico sin gestión estructural", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: false,
      isProgramMember: true,
      isCoordinator: false,
    });

    expect(capabilities.hasClinicalProgramAccess).toBe(true);
    expect(capabilities.canManageEnrollments).toBe(false);
    expect(capabilities.canRegisterAttendance).toBe(true);
    expect(capabilities.canCreateNotes).toBe(true);
    expect(capabilities.canManageActivities).toBe(false);
  });

  it("incluye a Secretaría y Administrador en la navegación de Programas", () => {
    expect(PERMISSIONS.PROGRAMS).toContain(Role.SECRETARIA);
    expect(PERMISSIONS.PROGRAMS).toContain(Role.ADMINISTRADOR);
  });
});
