// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { PatientSchema, UpdatePatientSchema } from '../patient.schema';

/**
 * Tests que verifican el bug fix: el formulario de edición de paciente
 * usaba PatientSchema (creación, campos obligatorios) en vez de
 * UpdatePatientSchema (edición, campos opcionales).
 *
 * Esto causaba que form.trigger() fallara silenciosamente cuando
 * campos como affiliationNumber, healthPlans, gender o address.city
 * estaban vacíos, haciendo que el botón "Guardar Cambios" no hiciera nada.
 */

describe('PatientSchema (creación)', () => {
  it('debe rechazar datos parciales sin campos obligatorios', () => {
    const partialData = {
      firstName: 'Juan',
      lastName: 'Pérez',
    };

    const result = PatientSchema.safeParse(partialData);

    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.issues.map((i) => i.path[0]);
      // Estos campos son obligatorios en PatientSchema
      expect(fieldErrors).toContain('userName');
      expect(fieldErrors).toContain('phoneNumber');
      expect(fieldErrors).toContain('birthDate');
      expect(fieldErrors).toContain('gender');
      expect(fieldErrors).toContain('affiliationNumber');
      expect(fieldErrors).toContain('healthPlans');
    }
  });

  it('debe rechazar affiliationNumber vacío', () => {
    const data = {
      firstName: 'Juan',
      lastName: 'Pérez',
      userName: '12345678',
      phoneNumber: '+541234567890',
      birthDate: '1990-01-01',
      gender: 'Masculino',
      address: {
        city: {
          id: 1,
          name: 'Rosario',
          state: { id: 1, name: 'Santa Fe', country: { id: 1, name: 'Argentina' } },
        },
      },
      healthPlans: [{ id: 1, name: 'Plan 210' }],
      affiliationNumber: '', // vacío
    };

    const result = PatientSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      const affiliationErrors = result.error.issues.filter(
        (i) => i.path[0] === 'affiliationNumber'
      );
      expect(affiliationErrors.length).toBeGreaterThan(0);
    }
  });

  it('debe rechazar healthPlans vacío', () => {
    const data = {
      firstName: 'Juan',
      lastName: 'Pérez',
      userName: '12345678',
      phoneNumber: '+541234567890',
      birthDate: '1990-01-01',
      gender: 'Masculino',
      address: {
        city: {
          id: 1,
          name: 'Rosario',
          state: { id: 1, name: 'Santa Fe', country: { id: 1, name: 'Argentina' } },
        },
      },
      healthPlans: [], // vacío
      affiliationNumber: '123456',
    };

    const result = PatientSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      const hpErrors = result.error.issues.filter(
        (i) => i.path[0] === 'healthPlans'
      );
      expect(hpErrors.length).toBeGreaterThan(0);
    }
  });
});

describe('UpdatePatientSchema (edición)', () => {
  it('debe aceptar datos parciales (solo firstName)', () => {
    const partialData = {
      firstName: 'Juan Actualizado',
    };

    const result = UpdatePatientSchema.safeParse(partialData);

    expect(result.success).toBe(true);
  });

  it('debe aceptar un objeto completamente vacío', () => {
    const result = UpdatePatientSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('debe aceptar solo observations', () => {
    const result = UpdatePatientSchema.safeParse({
      observations: 'Alergia a penicilina',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.observations).toBe('Alergia a penicilina');
    }
  });

  it('debe aceptar affiliationNumber vacío (es opcional en edición)', () => {
    const result = UpdatePatientSchema.safeParse({
      affiliationNumber: '',
    });

    expect(result.success).toBe(true);
  });

  it('debe aceptar sin healthPlans (es opcional en edición)', () => {
    const result = UpdatePatientSchema.safeParse({
      firstName: 'Juan',
      lastName: 'Pérez',
    });

    expect(result.success).toBe(true);
  });

  it('debe aceptar sin gender (es opcional en edición)', () => {
    const result = UpdatePatientSchema.safeParse({
      firstName: 'Juan',
    });

    expect(result.success).toBe(true);
  });

  it('debe aceptar sin address.city (es opcional en edición)', () => {
    const result = UpdatePatientSchema.safeParse({
      firstName: 'Juan',
    });

    expect(result.success).toBe(true);
  });

  it('debe rechazar email con formato inválido', () => {
    const result = UpdatePatientSchema.safeParse({
      email: 'no-es-un-email',
    });

    expect(result.success).toBe(false);
  });

  it('debe aceptar email vacío (campo opcional)', () => {
    const result = UpdatePatientSchema.safeParse({
      email: '',
    });

    expect(result.success).toBe(true);
  });

  it('debe aceptar datos completos de actualización', () => {
    const fullUpdate = {
      firstName: 'Juan Actualizado',
      lastName: 'Pérez',
      phoneNumber: '+541234567899',
      observations: 'Observación actualizada',
      affiliationNumber: '999999',
      gender: 'Masculino',
      bloodType: 'A+',
      rhFactor: '+',
    };

    const result = UpdatePatientSchema.safeParse(fullUpdate);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('Juan Actualizado');
      expect(result.data.observations).toBe('Observación actualizada');
      expect(result.data.affiliationNumber).toBe('999999');
    }
  });
});

describe('Comparación PatientSchema vs UpdatePatientSchema', () => {
  /**
   * Este test reproduce exactamente el escenario del bug:
   * Un paciente con affiliationNumber vacío y healthPlans vacío intenta
   * ser editado. Estos campos son obligatorios en PatientSchema pero
   * opcionales en UpdatePatientSchema.
   *
   * Con PatientSchema: form.trigger() retorna false → botón no hace nada
   * Con UpdatePatientSchema: form.trigger() retorna true → se envía el update
   */
  it('datos de edición sin affiliationNumber ni healthPlans deben fallar con PatientSchema pero pasar con UpdatePatientSchema', () => {
    const typicalEditData = {
      firstName: 'Juan Actualizado',
      lastName: 'Pérez',
      email: 'juan@test.com',
      userName: '12.345.678',
      phoneNumber: '+541234567890',
      birthDate: '1990-01-01',
      phoneNumber2: '',
      bloodType: '',
      rhFactor: '',
      gender: '',
      maritalStatus: '',
      observations: 'Observaciones del paciente',
      affiliationNumber: '',  // vacío → falla en PatientSchema
      healthPlans: [],        // vacío → falla en PatientSchema
    };

    // PatientSchema RECHAZA estos datos (causa del bug)
    const patientResult = PatientSchema.safeParse(typicalEditData);
    expect(patientResult.success).toBe(false);
    if (!patientResult.success) {
      const fieldErrors = patientResult.error.issues.map((i) => i.path[0]);
      expect(fieldErrors).toContain('affiliationNumber');
      expect(fieldErrors).toContain('healthPlans');
    }

    // UpdatePatientSchema ACEPTA estos datos (fix)
    const updateResult = UpdatePatientSchema.safeParse(typicalEditData);
    expect(updateResult.success).toBe(true);
  });

  it('datos completos con observations deben pasar UpdatePatientSchema', () => {
    // Nota: healthPlans tiene distinta forma en cada schema:
    // - PatientSchema: { id, name }
    // - UpdatePatientSchema: { id, name, healthInsurance: { id, name } }
    const updateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      userName: '12345678',
      phoneNumber: '+541234567890',
      birthDate: '1990-01-01',
      gender: 'Masculino',
      observations: 'Alergia a penicilina',
      affiliationNumber: '123456',
      healthPlans: [
        { id: 1, name: 'Plan 210', healthInsurance: { id: 1, name: 'OSDE' } },
      ],
    };

    const updateResult = UpdatePatientSchema.safeParse(updateData);
    expect(updateResult.success).toBe(true);
    if (updateResult.success) {
      expect(updateResult.data.observations).toBe('Alergia a penicilina');
    }
  });
});
