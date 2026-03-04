// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { PERMISSIONS, STRICT_PERMISSIONS, hasPermission } from "../permissions";
import { Role } from "@/common/enums/role.enum";

describe("PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS", () => {
  it("debe estar definido", () => {
    expect(PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS).toBeDefined();
  });

  it("debe incluir el rol SECRETARIA", () => {
    expect(PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS).toContain(Role.SECRETARIA);
  });

  it("debe incluir el rol ADMINISTRADOR", () => {
    expect(PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS).toContain(Role.ADMINISTRADOR);
  });

  it("NO debe incluir el rol MEDICO", () => {
    expect(PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS).not.toContain(Role.MEDICO);
  });

  it("NO debe incluir el rol PACIENTE", () => {
    expect(PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS).not.toContain(Role.PACIENTE);
  });
});

describe("hasPermission con OPERATOR_PRESCRIPTION_REQUESTS", () => {
  const allowedRoles = PERMISSIONS.OPERATOR_PRESCRIPTION_REQUESTS;

  it("SECRETARIA debe tener permiso", () => {
    expect(hasPermission([Role.SECRETARIA], allowedRoles)).toBe(true);
  });

  it("ADMINISTRADOR debe tener permiso", () => {
    expect(hasPermission([Role.ADMINISTRADOR], allowedRoles)).toBe(true);
  });

  it("MEDICO NO debe tener permiso", () => {
    expect(hasPermission([Role.MEDICO], allowedRoles)).toBe(false);
  });

  it("PACIENTE NO debe tener permiso", () => {
    expect(hasPermission([Role.PACIENTE], allowedRoles)).toBe(false);
  });

  it("usuario sin roles no debe tener permiso", () => {
    expect(hasPermission([], allowedRoles)).toBe(false);
  });

  it("usuario con múltiples roles donde uno es SECRETARIA debe tener permiso", () => {
    // Caso real: usuario con múltiples roles
    expect(hasPermission([Role.MEDICO, Role.SECRETARIA], allowedRoles)).toBe(true);
  });

  it("ADMINISTRADOR siempre tiene acceso por override automático", () => {
    // El admin tiene acceso porque hasPermission hace override de admin
    expect(hasPermission([Role.ADMINISTRADOR], allowedRoles, false)).toBe(true);
  });

  it("OPERATOR_PRESCRIPTION_REQUESTS NO está en STRICT_PERMISSIONS (admin tiene override)", () => {
    // Verificar que no está en los permisos estrictos
    // Si estuviera, el admin necesitaría estar explícitamente en la lista
    expect(STRICT_PERMISSIONS).not.toContain("OPERATOR_PRESCRIPTION_REQUESTS");
  });
});
