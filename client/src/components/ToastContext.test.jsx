import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastContext';

function Gatillo() {
  const { mostrar } = useToast();
  return (
    <>
      <button onClick={() => mostrar('exito', 'Perfil guardado.', 'Listo')}>aviso exito</button>
      <button onClick={() => mostrar('error', 'No se pudo guardar.')}>aviso error</button>
      <button onClick={() => mostrar('info', 'Nuevo mensaje.')}>aviso info</button>
    </>
  );
}

async function renderConToast() {
  return render(
    <ToastProvider>
      <Gatillo />
    </ToastProvider>
  );
}

describe('ToastContext', () => {
  it('muestra un toast de éxito con título y mensaje', async () => {
    const usuario = userEvent.setup();
    await renderConToast();
    await usuario.click(screen.getByRole('button', { name: 'aviso exito' }));
    expect(screen.getByText('Listo')).toBeInTheDocument();
    expect(screen.getByText('Perfil guardado.')).toBeInTheDocument();
  });

  it('usa la variante de error para mensajes de error', async () => {
    const usuario = userEvent.setup();
    await renderConToast();
    await usuario.click(screen.getByRole('button', { name: 'aviso error' }));
    const toast = screen.getByText('No se pudo guardar.').closest('.toast-app');
    expect(toast).toHaveClass('toast-app-error');
  });

  it('permite cerrar un toast con su botón', async () => {
    const usuario = userEvent.setup();
    await renderConToast();
    await usuario.click(screen.getByRole('button', { name: 'aviso info' }));
    expect(screen.getByText('Nuevo mensaje.')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.queryByText('Nuevo mensaje.')).not.toBeInTheDocument();
  });
});
