// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { SecretarySchema, UpdateSecretarySchema } from '../secretary.schema';
import { DoctorSchema, UpdateDoctorProfileSchema } from '../doctor.schema';

/**
 * Tests que verifican el fix de schemas para edición de Secretaria y Doctor.
 *
 * Bug: Los formularios de edición usaban schemas de creación (campos obligatorios),
 * causando que form.trigger() fallara silenciosamente cuando campos como gender,
 * address.city, etc. estaban vacíos → el botón "Guardar Cambios" no hacía nada.
 */

describe('SecretarySchema (creación)', () => {
  it('debe rechazar datos parciales sin campos obligatorios', () => {
    const partialData = {
      firstName: 'Ana',
      lastName: 'García',
    };

    const result = SecretarySchema.safeParse(partialData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const fieldErrors = result.error.issues.map((i) => i.path[0]);
      expect(fieldErrors).toContain('userName');
      expect(fieldErrors).toContain('birthDate');
      expect(fieldErrors).toContain('gender');
      expect(fieldErrors).toContain('address');
    }
  });
});

describe('UpdateSecretarySchema (edición)', () => {
  it('debe aceptar un objeto vacío', () => {
    const result = UpdateSecretarySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('debe aceptar datos parciales (solo firstName)', () => {
    const result = UpdateSecretarySchema.safeParse({
      firstName: 'Ana Actualizada',
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar sin gender (es opcional en edición)', () => {
    const result = UpdateSecretarySchema.safeParse({
      firstName: 'Ana',
      lastName: 'García',
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar sin address (es opcional en edición)', () => {
    const result = UpdateSecretarySchema.safeParse({
      firstName: 'Ana',
      phoneNumber: '+541234567890',
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar email vacío', () => {
    const result = UpdateSecretarySchema.safeParse({
      email: '',
    });
    expect(result.success).toBe(true);
  });

  it('debe rechazar email con formato inválido', () => {
    const result = UpdateSecretarySchema.safeParse({
      email: 'no-es-un-email',
    });
    expect(result.success).toBe(false);
  });

  it('debe aceptar datos completos de actualización', () => {
    const fullUpdate = {
      firstName: 'Ana Actualizada',
      lastName: 'García',
      phoneNumber: '+541234567899',
      gender: 'Femenino',
      bloodType: 'O+',
      rhFactor: '+',
    };
    const result = UpdateSecretarySchema.safeParse(fullUpdate);
    expect(result.success).toBe(true);
  });
});

describe('Comparación SecretarySchema vs UpdateSecretarySchema', () => {
  it('datos de edición sin gender ni address deben fallar con SecretarySchema pero pasar con UpdateSecretarySchema', () => {
    const typicalEditData = {
      firstName: 'Ana Actualizada',
      lastName: 'García',
      email: 'ana@test.com',
      phoneNumber: '+541234567890',
      gender: '',
      // sin address ni userName ni birthDate
    };

    // SecretarySchema RECHAZA (causa del bug)
    const secretaryResult = SecretarySchema.safeParse(typicalEditData);
    expect(secretaryResult.success).toBe(false);

    // UpdateSecretarySchema ACEPTA (fix)
    const updateResult = UpdateSecretarySchema.safeParse(typicalEditData);
    expect(updateResult.success).toBe(true);
  });
});

describe('DoctorSchema (creación)', () => {
  it('debe rechazar datos parciales sin campos obligatorios', () => {
    const partialData = {
      firstName: 'Dr. Carlos',
      lastName: 'López',
    };

    const result = DoctorSchema.safeParse(partialData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const fieldErrors = result.error.issues.map((i) => i.path[0]);
      expect(fieldErrors).toContain('userName');
      expect(fieldErrors).toContain('birthDate');
      expect(fieldErrors).toContain('gender');
      expect(fieldErrors).toContain('email');
      expect(fieldErrors).toContain('matricula');
    }
  });
});

describe('UpdateDoctorProfileSchema (edición)', () => {
  it('debe aceptar un objeto vacío', () => {
    const result = UpdateDoctorProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('debe aceptar datos parciales (solo firstName)', () => {
    const result = UpdateDoctorProfileSchema.safeParse({
      firstName: 'Carlos Actualizado',
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar sin matricula (es opcional en edición)', () => {
    const result = UpdateDoctorProfileSchema.safeParse({
      firstName: 'Carlos',
      lastName: 'López',
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar sin gender ni address (es opcional en edición)', () => {
    const result = UpdateDoctorProfileSchema.safeParse({
      firstName: 'Carlos',
      phoneNumber: '+541234567890',
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar solo specialities', () => {
    const result = UpdateDoctorProfileSchema.safeParse({
      specialities: [{ id: 1, name: 'Cardiología' }],
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar solo healthInsurances', () => {
    const result = UpdateDoctorProfileSchema.safeParse({
      healthInsurances: [{ id: 1, name: 'OSDE' }],
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar datos completos de actualización', () => {
    const fullUpdate = {
      firstName: 'Carlos Actualizado',
      lastName: 'López',
      email: 'carlos@test.com',
      phoneNumber: '+541234567899',
      matricula: 'MP-12345',
      gender: 'Masculino',
      specialities: [{ id: 1, name: 'Cardiología' }],
      healthInsurances: [{ id: 1, name: 'OSDE' }],
    };
    const result = UpdateDoctorProfileSchema.safeParse(fullUpdate);
    expect(result.success).toBe(true);
  });
});

describe('Comparación DoctorSchema vs UpdateDoctorProfileSchema', () => {
  it('datos de edición sin matricula ni gender deben fallar con DoctorSchema pero pasar con UpdateDoctorProfileSchema', () => {
    // En edición, los campos no modificados se omiten del payload
    const typicalEditData = {
      firstName: 'Carlos Actualizado',
      lastName: 'López',
      email: 'carlos@test.com',
      phoneNumber: '+541234567890',
      // sin matricula, gender, address, userName, birthDate
    };

    // DoctorSchema RECHAZA (causa del bug - requiere userName, birthDate, gender, matricula, etc.)
    const doctorResult = DoctorSchema.safeParse(typicalEditData);
    expect(doctorResult.success).toBe(false);
    if (!doctorResult.success) {
      const fieldErrors = doctorResult.error.issues.map((i) => i.path[0]);
      expect(fieldErrors).toContain('userName');
      expect(fieldErrors).toContain('birthDate');
      expect(fieldErrors).toContain('gender');
      expect(fieldErrors).toContain('matricula');
    }

    // UpdateDoctorProfileSchema ACEPTA (fix - todos los campos son opcionales)
    const updateResult = UpdateDoctorProfileSchema.safeParse(typicalEditData);
    expect(updateResult.success).toBe(true);
  });
});
