import { describe, it, expect } from 'vitest';
import {
  formatDni,
  formatMatricula,
  getGenderLabel,
  formatDateOnly,
  calculateAge,
  calculateAgeCollaborator,
  capitalizeWords,
  getInitials,
  formatCuilCuit,
  slugify,
  parseSlug,
  parseBoolean,
  getDoctorTitle,
  formatDoctorName,
  formatDoctorInfo,
} from './helpers';

describe('helpers', () => {
  describe('formatDni', () => {
    it('debe formatear un DNI de 8 dígitos con puntos', () => {
      expect(formatDni('12345678')).toBe('12.345.678');
    });

    it('debe formatear un DNI de 7 dígitos con puntos', () => {
      expect(formatDni('1234567')).toBe('1.234.567');
    });

    it('debe manejar undefined', () => {
      expect(formatDni(undefined as unknown as string)).toBe('');
    });

    it('debe manejar string vacío', () => {
      expect(formatDni('')).toBe('');
    });
  });

  describe('formatMatricula', () => {
    it('debe formatear una matrícula con puntos', () => {
      expect(formatMatricula('123456')).toBe('123.456');
    });
  });

  describe('getGenderLabel', () => {
    it('debe retornar Masculino para "Masculino"', () => {
      expect(getGenderLabel('Masculino')).toBe('Masculino');
    });

    it('debe retornar Femenino para "Femenino"', () => {
      expect(getGenderLabel('Femenino')).toBe('Femenino');
    });

    it('debe retornar Femenino para cualquier otro valor', () => {
      expect(getGenderLabel('otro')).toBe('Femenino');
    });
  });

  describe('formatDateOnly', () => {
    it('debe retornar "-" para string vacío', () => {
      expect(formatDateOnly('')).toBe('-');
    });

    it('debe retornar "-" para el valor "-"', () => {
      expect(formatDateOnly('-')).toBe('-');
    });

    it('debe convertir YYYY-MM-DD a DD-MM-YYYY', () => {
      expect(formatDateOnly('2025-01-23')).toBe('23-01-2025');
    });

    it('debe mantener formato DD-MM-YYYY si ya está en ese formato', () => {
      expect(formatDateOnly('23-01-2025')).toBe('23-01-2025');
    });
  });

  describe('calculateAge', () => {
    it('debe calcular la edad correctamente', () => {
      // Persona nacida hace 30 años
      const thirtyYearsAgo = new Date();
      thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
      const age = calculateAge(thirtyYearsAgo.toISOString());
      expect(age).toBe(30);
    });

    it('debe retornar 0 para fecha actual', () => {
      const today = new Date();
      const age = calculateAge(today.toISOString());
      expect(age).toBe(0);
    });
  });

  describe('calculateAgeCollaborator', () => {
    it('debe calcular edad desde formato DD-MM-YYYY', () => {
      const today = new Date();
      const thirtyYearsAgo = new Date(
        today.getFullYear() - 30,
        today.getMonth(),
        today.getDate() - 1 // Un día antes para asegurar que cumplió
      );
      const day = thirtyYearsAgo.getDate().toString().padStart(2, '0');
      const month = (thirtyYearsAgo.getMonth() + 1).toString().padStart(2, '0');
      const year = thirtyYearsAgo.getFullYear();
      const dateString = `${day}-${month}-${year}`;

      expect(calculateAgeCollaborator(dateString)).toBe(30);
    });

    it('debe retornar 0 para formato inválido', () => {
      expect(calculateAgeCollaborator('invalid')).toBe(0);
    });

    it('debe retornar 0 para fecha vacía', () => {
      expect(calculateAgeCollaborator('')).toBe(0);
    });
  });

  describe('capitalizeWords', () => {
    it('debe capitalizar cada palabra', () => {
      expect(capitalizeWords('juan perez')).toBe('Juan Perez');
    });

    it('debe manejar mayúsculas existentes', () => {
      expect(capitalizeWords('JUAN PEREZ')).toBe('Juan Perez');
    });

    it('debe manejar una sola palabra', () => {
      expect(capitalizeWords('juan')).toBe('Juan');
    });
  });

  describe('getInitials', () => {
    it('debe retornar las iniciales de nombre y apellido', () => {
      expect(getInitials('Juan', 'Pérez')).toBe('JP');
    });

    it('debe manejar nombres en minúscula', () => {
      expect(getInitials('juan', 'pérez')).toBe('JP');
    });

    it('debe manejar strings vacíos', () => {
      expect(getInitials('', '')).toBe('');
    });
  });

  describe('formatCuilCuit', () => {
    it('debe formatear CUIL/CUIT de 11 dígitos correctamente', () => {
      expect(formatCuilCuit('20123456789')).toBe('20-12345678-9');
    });

    it('debe formatear número como input', () => {
      expect(formatCuilCuit(20123456789)).toBe('20-12345678-9');
    });

    it('debe retornar error para menos de 11 dígitos', () => {
      expect(formatCuilCuit('123456789')).toBe('Número inválido, debe tener 11 dígitos.');
    });

    it('debe retornar error para más de 11 dígitos', () => {
      expect(formatCuilCuit('123456789012')).toBe('Número inválido, debe tener 11 dígitos.');
    });

    it('debe ignorar caracteres no numéricos', () => {
      expect(formatCuilCuit('20-12345678-9')).toBe('20-12345678-9');
    });
  });

  describe('slugify', () => {
    it('debe crear slug con nombre e id', () => {
      expect(slugify('Juan Pérez', 123)).toBe('juan-prez-123');
    });

    it('debe manejar espacios múltiples', () => {
      expect(slugify('Juan   Pérez', 1)).toBe('juan-prez-1');
    });

    it('debe manejar string con id string', () => {
      expect(slugify('Test', 'abc')).toBe('test-abc');
    });
  });

  describe('parseSlug', () => {
    it('debe extraer id y nombre de un slug', () => {
      const result = parseSlug('juan-perez-123');
      expect(result.id).toBe(123);
      // Nota: la función actual solo capitaliza la primera letra del string completo
      expect(result.formattedName).toBe('Juan perez');
    });

    it('debe manejar nombres con guiones', () => {
      const result = parseSlug('maria-del-carmen-456');
      expect(result.id).toBe(456);
      expect(result.formattedName).toBe('Maria del carmen');
    });
  });

  describe('parseBoolean', () => {
    describe('valores booleanos', () => {
      it('debe retornar true para true', () => {
        expect(parseBoolean(true)).toBe(true);
      });

      it('debe retornar false para false', () => {
        expect(parseBoolean(false)).toBe(false);
      });
    });

    describe('valores null/undefined', () => {
      it('debe retornar false para null', () => {
        expect(parseBoolean(null)).toBe(false);
      });

      it('debe retornar false para undefined', () => {
        expect(parseBoolean(undefined)).toBe(false);
      });
    });

    describe('valores numéricos', () => {
      it('debe retornar true para 1', () => {
        expect(parseBoolean(1)).toBe(true);
      });

      it('debe retornar false para 0', () => {
        expect(parseBoolean(0)).toBe(false);
      });

      it('debe retornar false para otros números', () => {
        expect(parseBoolean(2)).toBe(false);
        expect(parseBoolean(-1)).toBe(false);
      });
    });

    describe('valores string', () => {
      it('debe retornar true para "true"', () => {
        expect(parseBoolean('true')).toBe(true);
      });

      it('debe retornar true para "TRUE" (case insensitive)', () => {
        expect(parseBoolean('TRUE')).toBe(true);
      });

      it('debe retornar true para "1"', () => {
        expect(parseBoolean('1')).toBe(true);
      });

      it('debe retornar true para "si"', () => {
        expect(parseBoolean('si')).toBe(true);
      });

      it('debe retornar true para "sí" con tilde', () => {
        expect(parseBoolean('sí')).toBe(true);
      });

      it('debe retornar true para "yes"', () => {
        expect(parseBoolean('yes')).toBe(true);
      });

      it('debe retornar false para "false"', () => {
        expect(parseBoolean('false')).toBe(false);
      });

      it('debe retornar false para "0"', () => {
        expect(parseBoolean('0')).toBe(false);
      });

      it('debe retornar false para "no"', () => {
        expect(parseBoolean('no')).toBe(false);
      });

      it('debe manejar espacios', () => {
        expect(parseBoolean('  true  ')).toBe(true);
      });
    });
  });

  describe('getDoctorTitle', () => {
    it('debe retornar "Dra." para Femenino', () => {
      expect(getDoctorTitle('Femenino')).toBe('Dra.');
    });

    it('debe retornar "Dr." para Masculino', () => {
      expect(getDoctorTitle('Masculino')).toBe('Dr.');
    });

    it('debe retornar "Dr." para undefined', () => {
      expect(getDoctorTitle(undefined)).toBe('Dr.');
    });
  });

  describe('formatDoctorName', () => {
    it('debe formatear nombre completo con título masculino', () => {
      const result = formatDoctorName({
        firstName: 'Juan',
        lastName: 'Pérez',
        gender: 'Masculino',
      });
      expect(result).toBe('Dr. Juan Pérez');
    });

    it('debe formatear nombre completo con título femenino', () => {
      const result = formatDoctorName({
        firstName: 'María',
        lastName: 'García',
        gender: 'Femenino',
      });
      expect(result).toBe('Dra. María García');
    });

    it('debe manejar campos vacíos', () => {
      const result = formatDoctorName({});
      expect(result).toBe('Dr.');
    });
  });

  describe('formatDoctorInfo', () => {
    it('debe formatear información completa del doctor', () => {
      const doctor = {
        firstName: 'Juan',
        lastName: 'Pérez',
        gender: 'Masculino',
        specialities: [
          { id: 1, name: 'Cardiología' },
          { id: 2, name: 'Clínica Médica' },
        ],
      };

      const result = formatDoctorInfo(doctor);

      expect(result.fullName).toBe('Dr. Juan Pérez');
      expect(result.primarySpeciality).toBe('Cardiología');
      expect(result.allSpecialities).toBe('Cardiología, Clínica Médica');
      expect(result.hasSpecialities).toBe(true);
      expect(result.fullNameWithPrimarySpeciality).toBe('Dr. Juan Pérez - Cardiología');
      expect(result.fullNameWithAllSpecialities).toBe(
        'Dr. Juan Pérez - Cardiología, Clínica Médica'
      );
    });

    it('debe manejar doctor sin especialidades', () => {
      const doctor = {
        firstName: 'Juan',
        lastName: 'Pérez',
        specialities: [],
      };

      const result = formatDoctorInfo(doctor);

      expect(result.primarySpeciality).toBeNull();
      expect(result.allSpecialities).toBe('');
      expect(result.hasSpecialities).toBe(false);
      expect(result.fullNameWithPrimarySpeciality).toBe('Dr. Juan Pérez');
    });
  });
});
