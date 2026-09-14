import { beforeEach, describe, expect, it } from 'vitest';
import { esPerfilCompleto, leerUsuario, guardarUsuario } from './perfil';

const completo = {
  apellido_materno: 'García',
  pais: 'México',
  provincia: 'CDMX',
  acerca_de_mi: 'Estudiante de sistemas',
  especialidad_principal: 'Desarrollo Web',
  intereses: ['Desarrollo Web'],
  idiomas: ['Español'],
  educacion: { institucion: 'UNAM', titulo: 'Ing. en Sistemas' }
};

describe('esPerfilCompleto', () => {
  it('devuelve false cuando el usuario es nulo', () => {
    expect(esPerfilCompleto(null)).toBe(false);
    expect(esPerfilCompleto(undefined)).toBe(false);
  });

  it('devuelve true cuando el perfil tiene todos los campos', () => {
    expect(esPerfilCompleto(completo)).toBe(true);
  });

  it('devuelve false si falta el apellido materno', () => {
    expect(esPerfilCompleto({ ...completo, apellido_materno: '' })).toBe(false);
    expect(esPerfilCompleto({ ...completo, apellido_materno: undefined })).toBe(false);
  });

  it('devuelve false si no hay intereses', () => {
    expect(esPerfilCompleto({ ...completo, intereses: [] })).toBe(false);
    expect(esPerfilCompleto({ ...completo, intereses: undefined })).toBe(false);
  });

  it('devuelve false si falta el título de educación', () => {
    expect(esPerfilCompleto({ ...completo, educacion: { institucion: 'UNAM', titulo: '' } })).toBe(false);
    expect(esPerfilCompleto({ ...completo, educacion: undefined })).toBe(false);
  });
});

describe('leerUsuario / guardarUsuario', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('lee null cuando no hay usuario guardado', () => {
    expect(leerUsuario()).toBeNull();
  });

  it('guarda en localStorage cuando hay token y lo vuelve a leer', () => {
    localStorage.setItem('token', 'abc123');
    guardarUsuario({ nombre: 'Ana' });
    expect(localStorage.getItem('usuario')).toBe(JSON.stringify({ nombre: 'Ana' }));
    expect(leerUsuario().nombre).toBe('Ana');
  });

  it('guarda en sessionStorage cuando no hay token en localStorage', () => {
    guardarUsuario({ nombre: 'Bob' });
    expect(sessionStorage.getItem('usuario')).toBe(JSON.stringify({ nombre: 'Bob' }));
    expect(leerUsuario().nombre).toBe('Bob');
  });
});
