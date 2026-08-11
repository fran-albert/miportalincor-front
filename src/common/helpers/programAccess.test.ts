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
        // No es miembro del programa: el arancel mensual no le corresponde.
        canManageMonthlyPricing: false,
        // Tampoco lo clínico: la recepción no carga la ficha de ingreso.
        canRegisterClinicalIntake: false,
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

  it("le muestra el arancel mensual al admin que además es miembro del programa", () => {
    // Caso Vanesa (2026-08-02): Administrador + Secretaria + Médico y
    // coordinadora del programa. El backend ya la autorizaba (exige rol médico
    // + ser miembro); era el front el que le escondía la pestaña.
    const capabilities = getProgramAccessCapabilities({
      isAdmin: true,
      isSecretary: true,
      isProgramMember: true,
      isCoordinator: true,
    });

    expect(capabilities.canManageMonthlyPricing).toBe(true);
    // Sigue SIN acceso clínico: el arancel es económico, no clínico.
    expect(capabilities.hasClinicalProgramAccess).toBe(false);
    expect(capabilities.canCreateNotes).toBe(false);
  });

  it("le muestra el arancel mensual al miembro clínico de siempre", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: false,
      isProgramMember: true,
      isCoordinator: false,
    });

    expect(capabilities.canManageMonthlyPricing).toBe(true);
  });

  it("deja al médico miembro cargar la ficha de ingreso y el score", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: false,
      isProgramMember: true,
      isCoordinator: true,
      isDoctor: true,
    });

    expect(capabilities.canRegisterClinicalIntake).toBe(true);
  });

  it("el profesor lee lo clínico pero no carga la ficha ni el score", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: false,
      isProgramMember: true,
      isCoordinator: false,
      isDoctor: false,
    });

    expect(capabilities.hasClinicalProgramAccess).toBe(true);
    expect(capabilities.canRegisterClinicalIntake).toBe(false);
  });

  it("un médico que no es miembro del programa no carga la ficha", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: false,
      isSecretary: false,
      isProgramMember: false,
      isCoordinator: false,
      isDoctor: true,
    });

    expect(capabilities.canRegisterClinicalIntake).toBe(false);
  });

  it("no le muestra el arancel mensual a quien no es miembro del programa", () => {
    const capabilities = getProgramAccessCapabilities({
      isAdmin: true,
      isSecretary: false,
      isProgramMember: false,
      isCoordinator: false,
    });

    expect(capabilities.canManageMonthlyPricing).toBe(false);
  });
});
