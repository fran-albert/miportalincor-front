import { describe, it, expect } from 'vitest';
import reducer, {
  setCollaborator,
  setFormData,
  resetForm,
  resetAll,
} from './preOccupationalSlice';
import { Collaborator } from '@/types/Collaborator/Collaborator';

// Estado inicial esperado (resumido)
const initialFormData = {
  puesto: '',
  area: '',
  antiguedad: '',
  tiempo: '',
  evaluationType: 'preocupacional',
  conclusion: '',
  recomendaciones: '',
};

// Mock de colaborador
const mockCollaborator1: Collaborator = {
  id: 1,
  userName: '12345678',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@test.com',
} as Collaborator;

const mockCollaborator2: Collaborator = {
  id: 2,
  userName: '87654321',
  firstName: 'María',
  lastName: 'García',
  email: 'maria@test.com',
} as Collaborator;

describe('preOccupationalSlice', () => {
  describe('setCollaborator', () => {
    it('debe setear el colaborador correctamente', () => {
      const initialState = {
        collaborator: null,
        formData: initialFormData,
      } as ReturnType<typeof reducer>;

      const newState = reducer(initialState, setCollaborator(mockCollaborator1));

      expect(newState.collaborator).toEqual(mockCollaborator1);
    });

    it('debe resetear formData cuando cambia el collaboratorId', () => {
      // Estado con colaborador 1 y datos modificados
      const stateWithData = {
        collaborator: mockCollaborator1,
        formData: {
          ...initialFormData,
          puesto: 'Gerente',
          area: 'Ventas',
          conclusion: 'Apto',
        },
      } as ReturnType<typeof reducer>;

      // Cambiar a colaborador 2
      const newState = reducer(stateWithData, setCollaborator(mockCollaborator2));

      // El colaborador debe cambiar
      expect(newState.collaborator).toEqual(mockCollaborator2);

      // El formData debe resetearse (puesto, area, conclusion deben estar vacíos)
      expect(newState.formData.puesto).toBe('');
      expect(newState.formData.area).toBe('');
      expect(newState.formData.conclusion).toBe('');
    });

    it('NO debe resetear formData si el collaboratorId es el mismo', () => {
      // Estado con colaborador 1 y datos modificados
      const stateWithData = {
        collaborator: mockCollaborator1,
        formData: {
          ...initialFormData,
          puesto: 'Gerente',
          area: 'Ventas',
        },
      } as ReturnType<typeof reducer>;

      // Setear el mismo colaborador (mismo ID)
      const sameCollaborator = { ...mockCollaborator1, firstName: 'Juan Updated' };
      const newState = reducer(stateWithData, setCollaborator(sameCollaborator));

      // El formData NO debe resetearse
      expect(newState.formData.puesto).toBe('Gerente');
      expect(newState.formData.area).toBe('Ventas');
    });

    it('debe resetear formData cuando se pasa null', () => {
      const stateWithData = {
        collaborator: mockCollaborator1,
        formData: {
          ...initialFormData,
          puesto: 'Gerente',
        },
      } as ReturnType<typeof reducer>;

      const newState = reducer(stateWithData, setCollaborator(null));

      expect(newState.collaborator).toBeNull();
      expect(newState.formData.puesto).toBe('');
    });
  });

  describe('setFormData', () => {
    it('debe mergear datos sin perder los existentes', () => {
      const stateWithData = {
        collaborator: mockCollaborator1,
        formData: {
          ...initialFormData,
          puesto: 'Gerente',
          area: 'Ventas',
        },
      } as ReturnType<typeof reducer>;

      // Solo actualizar 'conclusion'
      const newState = reducer(stateWithData, setFormData({ conclusion: 'Apto' }));

      // Los datos anteriores deben mantenerse
      expect(newState.formData.puesto).toBe('Gerente');
      expect(newState.formData.area).toBe('Ventas');
      // Y el nuevo dato debe estar
      expect(newState.formData.conclusion).toBe('Apto');
    });
  });

  describe('resetForm', () => {
    it('debe resetear solo formData, no el collaborator', () => {
      const stateWithData = {
        collaborator: mockCollaborator1,
        formData: {
          ...initialFormData,
          puesto: 'Gerente',
          conclusion: 'Apto',
        },
      } as ReturnType<typeof reducer>;

      const newState = reducer(stateWithData, resetForm());

      // El colaborador debe mantenerse
      expect(newState.collaborator).toEqual(mockCollaborator1);
      // El formData debe resetearse
      expect(newState.formData.puesto).toBe('');
      expect(newState.formData.conclusion).toBe('');
    });
  });

  describe('resetAll', () => {
    it('debe resetear tanto collaborator como formData', () => {
      const stateWithData = {
        collaborator: mockCollaborator1,
        formData: {
          ...initialFormData,
          puesto: 'Gerente',
        },
      } as ReturnType<typeof reducer>;

      const newState = reducer(stateWithData, resetAll());

      expect(newState.collaborator).toBeNull();
      expect(newState.formData.puesto).toBe('');
    });
  });
});
