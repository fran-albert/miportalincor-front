import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  DNI_FORMAT_MESSAGE,
  getPatientSaveSuccessDescription,
  getPatientUpdateError,
  isValidDni,
  normalizeDni,
} from './patient-dni';

const apiError = (status: number, data: unknown): AxiosError =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  });

describe('normalizeDni', () => {
  it.each([
    ['20.181.345', '20181345'],
    ['20 181 345', '20181345'],
    [' 20181345 ', '20181345'],
    ['20-181-345', '20181345'],
    ['', ''],
  ])('"%s" -> "%s"', (input, expected) => {
    expect(normalizeDni(input)).toBe(expected);
  });

  it('tolera undefined y null', () => {
    expect(normalizeDni(undefined)).toBe('');
    expect(normalizeDni(null)).toBe('');
  });
});

describe('isValidDni', () => {
  it('acepta de 6 a 10 digitos, con o sin puntos', () => {
    expect(isValidDni('123456')).toBe(true);
    expect(isValidDni('20.181.345')).toBe(true);
    expect(isValidDni('1234567890')).toBe(true);
  });

  it('rechaza largos fuera de rango y texto', () => {
    expect(isValidDni('12345')).toBe(false);
    expect(isValidDni('12345678901')).toBe(false);
    expect(isValidDni('abc')).toBe(false);
  });

  it('expone el mensaje en español', () => {
    expect(DNI_FORMAT_MESSAGE).toBe(
      'El DNI debe tener entre 6 y 10 números, sin puntos ni espacios.',
    );
  });
});

describe('getPatientUpdateError', () => {
  it('409 de DNI en otra ficha activa: mensaje de la API y campo DNI', () => {
    const message =
      'El DNI 30111222 ya está cargado en otra ficha activa: Gomez, Juana. Puede ser un paciente duplicado: buscá ese DNI en Pacientes antes de seguir.';
    expect(
      getPatientUpdateError(
        apiError(409, {
          code: 'PATIENT_DNI_IN_USE',
          field: 'userName',
          message,
        }),
      ),
    ).toEqual({ message, field: 'userName' });
  });

  it('409 de DNI reservado por ficha dada de baja: campo DNI aunque falte field', () => {
    const message = 'El DNI 20181345 está reservado por una ficha dada de baja.';
    expect(
      getPatientUpdateError(
        apiError(409, {
          code: 'PATIENT_DNI_RESERVED_BY_DELETED_RECORD',
          message,
        }),
      ),
    ).toEqual({ message, field: 'userName' });
  });

  it('400 con varios mensajes de validacion: los une legibles', () => {
    expect(
      getPatientUpdateError(
        apiError(400, {
          message: [
            'El DNI debe contener entre 6 y 10 digitos numericos',
            'email must be an email',
          ],
        }),
      ),
    ).toEqual({
      message:
        'El DNI debe contener entre 6 y 10 digitos numericos. email must be an email',
      field: 'userName',
    });
  });

  it('409 de email: mensaje de la API, sin campo DNI', () => {
    expect(
      getPatientUpdateError(
        apiError(409, { message: 'Ya existe un usuario con el email indicado' }),
      ),
    ).toEqual({ message: 'Ya existe un usuario con el email indicado' });
  });

  it('sin respuesta del servidor: mensaje de conexion', () => {
    expect(getPatientUpdateError(new AxiosError('Network Error'))).toEqual({
      message:
        'No se pudo conectar con el servidor. Revisá la conexión e intentá de nuevo.',
    });
  });

  it('respuesta sin mensaje: texto generico', () => {
    expect(getPatientUpdateError(apiError(500, {}))).toEqual({
      message: 'Ha ocurrido un error inesperado',
    });
  });
});

describe('getPatientSaveSuccessDescription', () => {
  it('DNI cambiado y clave restablecida', () => {
    expect(
      getPatientSaveSuccessDescription('20181354', {
        userName: '20181345',
        passwordResetToNewDni: true,
      }),
    ).toBe(
      'DNI actualizado. El paciente ingresa con el DNI nuevo como usuario y como contraseña.',
    );
  });

  it('DNI cambiado y conserva su clave', () => {
    expect(
      getPatientSaveSuccessDescription('20181354', {
        userName: '20181345',
        passwordResetToNewDni: false,
      }),
    ).toBe(
      'DNI actualizado. El paciente ingresa con el DNI nuevo y conserva su contraseña.',
    );
  });

  it('DNI sin cambios (aunque venga con puntos): mensaje de siempre', () => {
    expect(
      getPatientSaveSuccessDescription('20.181.354', {
        userName: '20181354',
        passwordResetToNewDni: false,
      }),
    ).toBe('Los datos del paciente se actualizaron exitosamente');
  });

  it('API vieja sin el campo: si cambio el DNI, no promete nada de la clave', () => {
    expect(
      getPatientSaveSuccessDescription('20181354', { userName: '20181345' }),
    ).toBe('DNI actualizado. El paciente ingresa con el DNI nuevo.');
  });
});
