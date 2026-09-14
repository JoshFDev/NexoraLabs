import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idSecuencia = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const temporizadores = useRef({});

  const cerrar = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (temporizadores.current[id]) {
      clearTimeout(temporizadores.current[id]);
      delete temporizadores.current[id];
    }
  }, []);

  const mostrar = useCallback(
    (tipo, mensaje, titulo) => {
      const id = ++idSecuencia;
      const tipoValido = ['exito', 'error', 'info'].includes(tipo) ? tipo : 'info';
      setToasts((prev) => [...prev, { id, tipo: tipoValido, mensaje, titulo }]);
      temporizadores.current[id] = setTimeout(() => cerrar(id), 4500);
      return id;
    },
    [cerrar]
  );

  const iconos = {
    exito: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <ToastContext.Provider value={{ mostrar, cerrar }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-app toast-app-${t.tipo}`} role="status">
            <span className="toast-app-icono" aria-hidden="true">
              <span className="material-symbols-outlined">{iconos[t.tipo]}</span>
            </span>
            <div className="toast-app-cuerpo">
              {t.titulo && <strong className="toast-app-titulo">{t.titulo}</strong>}
              <span className="toast-app-mensaje">{t.mensaje}</span>
            </div>
            <button type="button" className="toast-app-cerrar" aria-label="Cerrar aviso" onClick={() => cerrar(t.id)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}
