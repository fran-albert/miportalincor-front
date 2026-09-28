// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Patient } from '@/types/Patient/Patient';
import React from 'react';
import { AxiosError, AxiosHeaders } from 'axios';

// --- Mocks ---

const mockMutateAsync = vi.fn().mockResolvedValue({});
const mockPromiseToast = vi.fn().mockImplementation((promise: Promise<unknown>) => promise);
const mockShowError = vi.fn();

vi.mock('@/hooks/Patient/usePatientMutation', () => ({
  usePatientMutations: () => ({
    updatePatientMutation: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  }),
}));

vi.mock('@/hooks/Toast/toast-context', () => ({
  useToastContext: () => ({
    promiseToast: mockPromiseToast,
    showError: mockShowError,
  }),
}));

vi.mock('@/hooks/useRoles', () => ({
  default: () => ({
    isPatient: false,
    isDoctor: false,
    isSecretary: true,
    isAdmin: false,
    session: { id: 'SEC-001', email: 'sec@test.com', role: ['Secretaria'] },
  }),
}));

// Mock complex sub-components that are hard to render in test env
vi.mock('@/components/Select/City/select', () => ({
  CitySelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="city-select" disabled={disabled}>
      <option>Rosario</option>
    </select>
  ),
}));

vi.mock('@/components/Select/State/select', () => ({
  StateSelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="state-select" disabled={disabled}>
      <option>Santa Fe</option>
    </select>
  ),
}));

vi.mock('@/components/Select/Blood/select', () => ({
  BloodSelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="blood-select" disabled={disabled}>
      <option>A+</option>
    </select>
  ),
}));

vi.mock('@/components/Select/RHFactor/select', () => ({
  RHFactorSelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="rh-select" disabled={disabled}>
      <option>+</option>
    </select>
  ),
}));

vi.mock('@/components/Select/Gender/select', () => ({
  GenderSelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="gender-select" disabled={disabled}>
      <option>Masculino</option>
    </select>
  ),
}));

vi.mock('@/components/Select/MaritalStatus/select', () => ({
  MaritalStatusSelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="marital-select" disabled={disabled}>
      <option>Soltero</option>
    </select>
  ),
}));

vi.mock('@/components/Select/HealthInsurace/select', () => ({
  HealthInsuranceSelect: ({ disabled }: { disabled?: boolean }) => (
    <select data-testid="health-insurance-select" disabled={disabled}>
      <option>OSDE</option>
    </select>
  ),
}));

vi.mock('@/components/Date-Picker', () => ({
  default: ({ disabled }: { disabled?: boolean }) => (
    <input data-testid="date-picker" disabled={disabled} type="text" />
  ),
}));

vi.mock('@/components/PageHeader', () => ({
  PageHeader: ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <div data-testid="page-header-actions">{actions}</div>
    </div>
  ),
}));

vi.mock('@/components/Button/Reset-Default-Password', () => ({
  default: () => <button data-testid="reset-password-btn">Reset</button>,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, ...validProps } = props;
      void initial; void animate; void transition;
      return <div {...validProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Import component AFTER all vi.mock() calls (vi.mock is hoisted)
import PatientProfileComponent from '../index';

// --- Helpers ---

const mockPatient: Patient = {
  id: '1',
  userId: '100',
  userName: '12345678',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@test.com',
  phoneNumber: '+541234567890',
  phoneNumber2: '',
  birthDate: '1990-01-01',
  photo: '',
  bloodType: 'A+',
  rhFactor: '+',
  gender: 'Masculino',
  maritalStatus: 'Soltero',
  observations: 'Observación inicial',
  affiliationNumber: '123456',
  dni: '12345678',
  cuil: '20-12345678-9',
  healthPlans: [
    { id: 1, name: 'Plan 210', healthInsurance: { id: 1, name: 'OSDE' } },
  ],
  address: {
    id: 1,
    street: 'Calle Falsa',
    number: '123',
    description: '',
    phoneNumber: '',
    city: {
      id: 2104,
      name: 'Rosario',
      state: {
        id: 22,
        name: 'Santa Fe',
        country: { id: 1, name: 'Argentina' },
      },
    },
  },
  roles: ['Paciente'],
  active: true,
} as unknown as Patient;

function createMockStore() {
  return configureStore({
    reducer: {
      auth: () => ({
        token: 'fake-token',
        tokenExpiration: String(Date.now() + 3600000),
      }),
    },
  });
}

function renderComponent(patient: Patient = mockPatient) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <Provider store={createMockStore()}>
      <QueryClientProvider client={queryClient}>
        <PatientProfileComponent
          patient={patient}
          breadcrumbItems={[{ label: 'Pacientes', href: '/pacientes' }]}
        />
      </QueryClientProvider>
    </Provider>
  );
}

// --- Tests ---

describe('PatientProfileComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modo visualización', () => {
    it('debe renderizar los datos del paciente', () => {
      renderComponent();

      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
      expect(screen.getByDisplayValue('juan@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+541234567890')).toBeInTheDocument();
    });

    it('debe mostrar el botón "Editar Perfil" para Secretaria', () => {
      renderComponent();

      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    it('debe tener los campos deshabilitados por defecto', () => {
      renderComponent();

      const firstNameInput = screen.getByDisplayValue('Juan');
      expect(firstNameInput).toBeDisabled();
    });
  });

  describe('Modo edición', () => {
    it('debe habilitar los campos al hacer clic en "Editar Perfil"', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Editar Perfil'));

      const firstNameInput = screen.getByDisplayValue('Juan');
      expect(firstNameInput).not.toBeDisabled();
    });

    it('debe mostrar botones "Guardar Cambios" y "Cancelar" en modo edición', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Editar Perfil'));

      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('debe volver a modo visualización al hacer clic en "Cancelar"', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Editar Perfil'));
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();

      await user.click(screen.getByText('Cancelar'));
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });
  });

  describe('Guardar cambios (fix del bug principal)', () => {
    it('debe usar UpdatePatientSchema - se renderiza con datos parciales sin errores', () => {
      // Si el componente usara PatientSchema, los campos obligatorios vacíos
      // causarían errores de validación inmediatos. Con UpdatePatientSchema
      // todos los campos son opcionales, permitiendo la edición.
      const minimalPatient = {
        ...mockPatient,
        affiliationNumber: '',
        healthPlans: [],
        gender: '',
      } as unknown as Patient;

      renderComponent(minimalPatient);
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    });

    it('debe permitir editar observations en el formulario', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Editar Perfil'));

      const obsInput = screen.getByDisplayValue('Observación inicial');
      expect(obsInput).not.toBeDisabled();

      await user.clear(obsInput);
      await user.type(obsInput, 'Nueva observación');

      expect(screen.getByDisplayValue('Nueva observación')).toBeInTheDocument();
    });

    it('debe wiring mutación al botón Guardar Cambios (handleSave configurado)', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Editar Perfil'));

      // Verificar que el botón "Guardar Cambios" existe y está habilitado
      const saveButton = screen.getByText('Guardar Cambios');
      expect(saveButton).toBeInTheDocument();
      expect(saveButton.closest('button')).not.toBeDisabled();

      // Verificar que updatePatientMutation.isPending=false no bloquea el botón
      expect(saveButton.closest('button')?.textContent).toContain('Guardar Cambios');
    });
  });

  describe('Renderizado de campos', () => {
    it('debe mostrar el campo de observations', () => {
      renderComponent();

      expect(screen.getByDisplayValue('Observación inicial')).toBeInTheDocument();
    });

    it('debe mostrar el campo de affiliationNumber', () => {
      renderComponent();

      expect(screen.getByDisplayValue('123456')).toBeInTheDocument();
    });
  });
  describe('Corregir DNI', () => {
    const conflict = (data: Record<string, unknown>) =>
      new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data,
      });

    const editDni = async (value: string) => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByText('Editar Perfil'));
      const dniInput = screen.getByPlaceholderText('Ingresar D.N.I...');
      await user.clear(dniInput);
      await user.type(dniInput, value);
      return user;
    };

    it('muestra junto al DNI el motivo exacto del 409 (ficha activa)', async () => {
      const message =
        'El DNI 30111222 ya está cargado en otra ficha activa: Gomez, Juana. Puede ser un paciente duplicado: buscá ese DNI en Pacientes antes de seguir.';
      mockMutateAsync.mockRejectedValueOnce(
        conflict({ code: 'PATIENT_DNI_IN_USE', field: 'userName', message }),
      );

      const user = await editDni('30111222');
      await user.click(screen.getByText('Guardar Cambios'));

      expect(await screen.findByText(message)).toBeInTheDocument();
      // Sigue en modo edicion para que pueda corregirlo.
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
    });

    it('muestra el motivo del 409 de ficha dada de baja', async () => {
      const message =
        'El DNI 20181345 está reservado por una ficha dada de baja. No se puede usar hasta unificar las dos fichas: pedí la unificación a soporte indicando este DNI y el paciente que estás editando.';
      mockMutateAsync.mockRejectedValueOnce(
        conflict({ code: 'PATIENT_DNI_RESERVED_BY_DELETED_RECORD', message }),
      );

      const user = await editDni('20181345');
      await user.click(screen.getByText('Guardar Cambios'));

      expect(await screen.findByText(message)).toBeInTheDocument();
    });

    it('el toast de error usa el mismo mensaje de la API', async () => {
      const message = 'Ya existe un usuario con el email indicado';
      mockMutateAsync.mockRejectedValueOnce(conflict({ message }));

      const user = await editDni('12345678');
      await user.click(screen.getByText('Guardar Cambios'));

      await vi.waitFor(() => expect(mockPromiseToast).toHaveBeenCalled());
      const [, messages] = mockPromiseToast.mock.calls[0] as [
        Promise<unknown>,
        { error: (error: unknown) => { title: string; description?: string } },
      ];
      expect(messages.error(conflict({ message })).description).toBe(message);
    });

    it.each([
      ['20.181.399', '20181399'],
      ['20 181 399', '20181399'],
    ])('envía "%s" normalizado como %s', async (typed, expected) => {
      const user = await editDni(typed);
      await user.click(screen.getByText('Guardar Cambios'));

      await vi.waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
      const [{ patient }] = mockMutateAsync.mock.calls[0] as [
        { patient: { userName: string } },
      ];
      expect(patient.userName).toBe(expected);
    });

    it('no envía un DNI inválido y avisa qué corregir', async () => {
      const user = await editDni('1234');
      await user.click(screen.getByText('Guardar Cambios'));

      expect(
        await screen.findByText(
          'El DNI debe tener entre 6 y 10 números, sin puntos ni espacios.',
        ),
      ).toBeInTheDocument();
      expect(mockMutateAsync).not.toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith(
        'Revisá los datos marcados',
        'Hay campos con errores. Corregilos y volvé a guardar.',
      );
    });

    it('no manda campos que la API rechaza (whitelist)', async () => {
      const user = await editDni('20181399');
      await user.click(screen.getByText('Guardar Cambios'));

      await vi.waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
      const [{ patient }] = mockMutateAsync.mock.calls[0] as [
        { patient: Record<string, unknown> },
      ];
      expect(patient.userName).toBe('20181399');
      for (const forbidden of ['password', 'roles', 'dni', 'userId', 'registrationDate']) {
        expect(patient).not.toHaveProperty(forbidden);
      }
    });
  });
  describe('Aviso de éxito al corregir el DNI', () => {
    type SuccessMessage =
      | { title: string; description?: string }
      | ((result: unknown) => { title: string; description?: string });

    const successDescriptionFor = async (
      typedDni: string | null,
      saved: Record<string, unknown>,
    ) => {
      mockMutateAsync.mockResolvedValueOnce(saved);
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByText('Editar Perfil'));
      if (typedDni !== null) {
        const dniInput = screen.getByPlaceholderText('Ingresar D.N.I...');
        await user.clear(dniInput);
        await user.type(dniInput, typedDni);
      }
      await user.click(screen.getByText('Guardar Cambios'));

      await vi.waitFor(() => expect(mockPromiseToast).toHaveBeenCalled());
      const [, messages] = mockPromiseToast.mock.calls[0] as [
        Promise<unknown>,
        { success: SuccessMessage },
      ];
      const success =
        typeof messages.success === 'function'
          ? messages.success(saved)
          : messages.success;
      return success.description;
    };

    it('clave restablecida: DNI nuevo como usuario y como contraseña', async () => {
      expect(
        await successDescriptionFor('20181399', {
          userName: '20181399',
          passwordResetToNewDni: true,
        }),
      ).toBe(
        'DNI actualizado. El paciente ingresa con el DNI nuevo como usuario y como contraseña.',
      );
    });

    it('clave propia: DNI nuevo y conserva su contraseña', async () => {
      expect(
        await successDescriptionFor('20181399', {
          userName: '20181399',
          passwordResetToNewDni: false,
        }),
      ).toBe(
        'DNI actualizado. El paciente ingresa con el DNI nuevo y conserva su contraseña.',
      );
    });

    it('sin cambio de DNI: el mensaje de siempre', async () => {
      expect(
        await successDescriptionFor(null, {
          userName: '12345678',
          passwordResetToNewDni: false,
        }),
      ).toBe('Los datos del paciente se actualizaron exitosamente');
    });
  });
});
