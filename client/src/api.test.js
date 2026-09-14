import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';

describe('cliente axios', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('usa la URL por defecto cuando no hay VITE_API_URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('agrega el token de localStorage al encabezado Authorization', () => {
    localStorage.setItem('token', 'abc123');
    const [pedido] = api.interceptors.request.handlers;
    const config = { headers: {} };
    const resultado = pedido.fulfilled(config);
    expect(resultado.headers.Authorization).toBe('Bearer abc123');
  });

  it('no agrega Authorization cuando no hay token', () => {
    const [pedido] = api.interceptors.request.handlers;
    const config = { headers: {} };
    const resultado = pedido.fulfilled(config);
    expect(resultado.headers.Authorization).toBeUndefined();
  });

  it('en un 401 limpia el storage y redirige a /login', async () => {
    localStorage.setItem('token', 'x');
    localStorage.setItem('usuario', '{"nombre":"Ana"}');
    sessionStorage.setItem('token', 'x');

    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/perfil', href: '' },
    });

    const [respuesta] = api.interceptors.response.handlers;
    const error = { response: { status: 401 } };
    await expect(respuesta.rejected(error)).rejects.toBe(error);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  it('en un 401 no redirige si ya está en /login', async () => {
    window.history.pushState({}, '', '/login');
    localStorage.setItem('token', 'x');

    const [respuesta] = api.interceptors.response.handlers;
    const error = { response: { status: 401 } };
    await expect(respuesta.rejected(error)).rejects.toBe(error);

    expect(window.location.pathname).toBe('/login');
  });
});