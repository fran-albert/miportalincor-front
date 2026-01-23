import { describe, it, expect } from 'vitest';
import { mapVisual } from './maps';
import { DataValue } from '@/types/Data-Value/Data-Value';

// Helper para crear DataValue de prueba
function createDataValue(
  name: string,
  category: string,
  value: string,
  observations?: string
): DataValue {
  return {
    id: Math.random(),
    name,
    dataType: {
      id: Math.random(),
      name,
      category,
      dataType: 'STRING',
    },
    value,
    observations,
  } as DataValue;
}

describe('mapVisual', () => {
  describe('cuando no hay datos', () => {
    it('debe retornar strings vacíos para agudeza', () => {
      const result = mapVisual([]);

      expect(result.agudezaSc).toEqual({ right: '', left: '' });
      expect(result.agudezaCc).toEqual({ right: '', left: '' });
    });

    it('debe retornar "normal" como default para visión cromática', () => {
      const result = mapVisual([]);

      expect(result.visionCromatica).toBe('normal');
    });

    it('debe retornar string vacío para notas', () => {
      const result = mapVisual([]);

      expect(result.notasVision).toBe('');
    });
  });

  describe('mapeo de agudeza visual', () => {
    it('debe mapear correctamente agudeza S/C (sin corrección)', () => {
      const dataValues: DataValue[] = [
        createDataValue('Agudeza S/C Derecho', 'EXAMEN_CLINICO', '10/10'),
        createDataValue('Agudeza S/C Izquierdo', 'EXAMEN_CLINICO', '8/10'),
      ];

      const result = mapVisual(dataValues);

      expect(result.agudezaSc.right).toBe('10/10');
      expect(result.agudezaSc.left).toBe('8/10');
    });

    it('debe mapear correctamente agudeza C/C (con corrección)', () => {
      const dataValues: DataValue[] = [
        createDataValue('Agudeza C/C Derecho', 'EXAMEN_CLINICO', '10/10'),
        createDataValue('Agudeza C/C Izquierdo', 'EXAMEN_CLINICO', '9/10'),
      ];

      const result = mapVisual(dataValues);

      expect(result.agudezaCc.right).toBe('10/10');
      expect(result.agudezaCc.left).toBe('9/10');
    });

    it('NO debe mezclar valores entre S/C y C/C', () => {
      const dataValues: DataValue[] = [
        // Sin corrección
        createDataValue('Agudeza S/C Derecho', 'EXAMEN_CLINICO', '5/10'),
        createDataValue('Agudeza S/C Izquierdo', 'EXAMEN_CLINICO', '6/10'),
        // Con corrección
        createDataValue('Agudeza C/C Derecho', 'EXAMEN_CLINICO', '10/10'),
        createDataValue('Agudeza C/C Izquierdo', 'EXAMEN_CLINICO', '10/10'),
      ];

      const result = mapVisual(dataValues);

      // S/C debe tener sus valores
      expect(result.agudezaSc.right).toBe('5/10');
      expect(result.agudezaSc.left).toBe('6/10');

      // C/C debe tener sus valores (diferentes)
      expect(result.agudezaCc.right).toBe('10/10');
      expect(result.agudezaCc.left).toBe('10/10');

      // Verificar que NO se mezclaron
      expect(result.agudezaSc.right).not.toBe(result.agudezaCc.right);
    });

    it('debe manejar valores parciales (solo un ojo)', () => {
      const dataValues: DataValue[] = [
        createDataValue('Agudeza S/C Derecho', 'EXAMEN_CLINICO', '10/10'),
        // Sin valor para ojo izquierdo
      ];

      const result = mapVisual(dataValues);

      expect(result.agudezaSc.right).toBe('10/10');
      expect(result.agudezaSc.left).toBe(''); // Debe ser vacío, no mezclarse
    });

    it('debe ignorar datos con categoría incorrecta', () => {
      const dataValues: DataValue[] = [
        // Categoría correcta
        createDataValue('Agudeza S/C Derecho', 'EXAMEN_CLINICO', '10/10'),
        // Categoría incorrecta - debe ignorarse
        createDataValue('Agudeza S/C Izquierdo', 'OTRA_CATEGORIA', '5/10'),
      ];

      const result = mapVisual(dataValues);

      expect(result.agudezaSc.right).toBe('10/10');
      expect(result.agudezaSc.left).toBe(''); // Debe ser vacío porque la categoría no coincide
    });
  });

  describe('mapeo de visión cromática', () => {
    it('debe mapear "normal" correctamente', () => {
      const dataValues: DataValue[] = [
        createDataValue('Visión Cromática', 'EXAMEN_CLINICO', 'normal'),
      ];

      const result = mapVisual(dataValues);

      expect(result.visionCromatica).toBe('normal');
    });

    it('debe mapear "anormal" correctamente', () => {
      const dataValues: DataValue[] = [
        createDataValue('Visión Cromática', 'EXAMEN_CLINICO', 'anormal'),
      ];

      const result = mapVisual(dataValues);

      expect(result.visionCromatica).toBe('anormal');
    });

    it('debe ser case-insensitive (NORMAL -> normal)', () => {
      const dataValues: DataValue[] = [
        createDataValue('Visión Cromática', 'EXAMEN_CLINICO', 'NORMAL'),
      ];

      const result = mapVisual(dataValues);

      expect(result.visionCromatica).toBe('normal');
    });

    it('debe defaultear a "normal" si el valor es inválido', () => {
      const dataValues: DataValue[] = [
        createDataValue('Visión Cromática', 'EXAMEN_CLINICO', 'otro_valor'),
      ];

      const result = mapVisual(dataValues);

      expect(result.visionCromatica).toBe('normal');
    });

    it('debe mapear observaciones a notasVision', () => {
      const dataValues: DataValue[] = [
        {
          ...createDataValue('Visión Cromática', 'EXAMEN_CLINICO', 'normal'),
          observations: 'Usa lentes desde hace 5 años',
        },
      ];

      const result = mapVisual(dataValues);

      expect(result.notasVision).toBe('Usa lentes desde hace 5 años');
    });
  });

  describe('escenario completo', () => {
    it('debe mapear todos los campos correctamente juntos', () => {
      const dataValues: DataValue[] = [
        createDataValue('Agudeza S/C Derecho', 'EXAMEN_CLINICO', '8/10'),
        createDataValue('Agudeza S/C Izquierdo', 'EXAMEN_CLINICO', '7/10'),
        createDataValue('Agudeza C/C Derecho', 'EXAMEN_CLINICO', '10/10'),
        createDataValue('Agudeza C/C Izquierdo', 'EXAMEN_CLINICO', '10/10'),
        {
          ...createDataValue('Visión Cromática', 'EXAMEN_CLINICO', 'normal'),
          observations: 'Sin observaciones',
        },
      ];

      const result = mapVisual(dataValues);

      expect(result).toEqual({
        agudezaSc: { right: '8/10', left: '7/10' },
        agudezaCc: { right: '10/10', left: '10/10' },
        visionCromatica: 'normal',
        notasVision: 'Sin observaciones',
      });
    });
  });
});
