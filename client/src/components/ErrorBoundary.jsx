import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <span className="error-boundary-icono" aria-hidden="true">
            <span className="material-symbols-outlined">error</span>
          </span>
          <h2>Algo salió mal</h2>
          <p className="error-boundary-mensaje">
            Ocurrió un error inesperado en NexoraLabs. Recarga la página o intenta de nuevo.
          </p>
          <small className="error-boundary-detalle">{this.state.error.message}</small>
          <div className="error-boundary-acciones">
            <button
              type="button"
              className="error-boundary-boton"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
            <button
              type="button"
              className="error-boundary-boton error-boundary-boton-claro"
              onClick={() => this.setState({ error: null })}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;