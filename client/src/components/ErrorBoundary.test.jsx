import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

function Explota() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renderiza a los hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <span>contenido</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('muestra el fallback con el mensaje del error cuando un hijo lanza una excepción', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Explota />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('"Intentar de nuevo" restaura el contenido al remontar', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const usuario = userEvent.setup();
    let fallo = true;

    function Simulacion() {
      if (fallo) throw new Error('boom');
      return <span>recuperado</span>;
    }

    render(
      <ErrorBoundary>
        <Simulacion />
      </ErrorBoundary>
    );

    fallo = false;
    await usuario.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
    expect(await screen.findByText('recuperado')).toBeInTheDocument();
    spy.mockRestore();
  });
});
