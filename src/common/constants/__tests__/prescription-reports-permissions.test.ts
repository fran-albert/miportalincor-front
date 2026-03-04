// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { PERMISSIONS, STRICT_PERMISSIONS, hasPermission } from "../permissions";
import { Role } from "@/common/enums/role.enum";

describe("PERMISSIONS.PRESCRIPTION_REPORTS", () => {
  it("debe estar definido", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).toBeDefined();
  });

  it("debe incluir SOLO el rol ADMINISTRADOR", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).toContain(Role.ADMINISTRADOR);
  });

  it("NO debe incluir el rol MEDICO", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).not.toContain(Role.MEDICO);
  });

  it("NO debe incluir el rol SECRETARIA", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).not.toContain(Role.SECRETARIA);
  });

  it("NO debe incluir el rol PACIENTE", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).not.toContain(Role.PACIENTE);
  });

  it("NO debe incluir el rol PROFESOR", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).not.toContain(Role.PROFESOR);
  });

  it("debe tener exactamente 1 rol permitido (solo ADMINISTRADOR)", () => {
    expect(PERMISSIONS.PRESCRIPTION_REPORTS.length).toBe(1);
  });
});

describe("hasPermission con PRESCRIPTION_REPORTS", () => {
  const allowedRoles = PERMISSIONS.PRESCRIPTION_REPORTS;

  it("ADMINISTRADOR debe tener permiso", () => {
    expect(hasPermission([Role.ADMINISTRADOR], allowedRoles)).toBe(true);
  });

  it("MEDICO NO debe tener permiso (sin override de admin)", () => {
    expect(hasPermission([Role.MEDICO], allowedRoles, true)).toBe(false);
  });

  it("SECRETARIA NO debe tener permiso", () => {
    expect(hasPermission([Role.SECRETARIA], allowedRoles, true)).toBe(false);
  });

  it("PACIENTE NO debe tener permiso", () => {
    expect(hasPermission([Role.PACIENTE], allowedRoles, true)).toBe(false);
  });

  it("usuario sin roles no debe tener permiso", () => {
    expect(hasPermission([], allowedRoles)).toBe(false);
  });

  it("ADMINISTRADOR tiene acceso por override automático (sin skipAdminOverride)", () => {
    expect(hasPermission([Role.ADMINISTRADOR], allowedRoles, false)).toBe(true);
  });

  it("usuario con múltiples roles donde uno es ADMINISTRADOR debe tener permiso", () => {
    expect(hasPermission([Role.MEDICO, Role.ADMINISTRADOR], allowedRoles)).toBe(true);
  });

  it("PRESCRIPTION_REPORTS NO está en STRICT_PERMISSIONS (admin tiene override)", () => {
    expect(STRICT_PERMISSIONS).not.toContain("PRESCRIPTION_REPORTS");
  });
});

describe("PRESCRIPTION_REPORTS vs otros permisos de reportes", () => {
  it("REPORTS incluye MEDICO pero PRESCRIPTION_REPORTS no", () => {
    expect(PERMISSIONS.REPORTS).toContain(Role.MEDICO);
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).not.toContain(Role.MEDICO);
  });

  it("STATISTICS y PRESCRIPTION_REPORTS son ambos solo ADMINISTRADOR", () => {
    expect(PERMISSIONS.STATISTICS).toContain(Role.ADMINISTRADOR);
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).toContain(Role.ADMINISTRADOR);
  });

  it("PRESCRIPTION_REPORTS es más restrictivo que OPERATOR_PRESCRIPTION_REQUESTS", () => {
    // OPERATOR incluye SECRETARIA y ADMIN; PRESCRIPTION_REPORTS solo ADMIN
    expect(PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS).toContain(Role.SECRETARIA);
    expect(PERMISSIONS.PRESCRIPTION_REPORTS).not.toContain(Role.SECRETARIA);
  });
});
