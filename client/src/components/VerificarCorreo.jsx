import { useEffect, useState } from 'react';
import { Button, Alert, Form, Spinner, InputGroup } from 'react-bootstrap';
import api from '../api';
import './VerificarCorreo.css';

const IconoCodigo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M9 10l4 4m0-4l-4 4" />
    <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Panel para ingresar el código de verificación del correo.
// - `email`: correo al que se envió el código.
// - `onVerificado`: recibe { token, usuario } cuando el correo se confirma.
// - `yaEnviado`: false si el código se acaba de enviar (registro), true si se reenvía aquí (login).
function VerificarCorreo({ email, onVerificado, yaEnviado = false }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [seg, setSeg] = useState(60);

  useEffect(() => {
    setMsg(yaEnviado ? 'Te enviamos un código a tu correo.' : 'Revisa tu correo para obtener el código.');
  }, [yaEnviado]);

  useEffect(() => {
    if (seg <= 0) return;
    const t = setTimeout(() => setSeg((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seg]);

  const verificar = async (e) => {
    e.preventDefault();
    setError('');
    if (codigo.length !== 6) {
      setError('Ingresa el código de 6 dígitos que recibiste.');
      return;
    }
    setCargando(true);
    try {
      const res = await api.post('/usuario/verificar-email', { email, codigo });
      onVerificado(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido o expirado. Inténtalo de nuevo.');
      setCodigo('');
      setCargando(false);
    }
  };

  const reenviar = async () => {
    setReenviando(true);
    setError('');
    try {
      const res = await api.post('/usuario/reenviar-codigo', { email });
      setMsg(res.data?.mensaje || 'Te enviamos un código nuevo a tu correo.');
      setSeg(60);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos reenviar el código. Inténtalo en unos minutos.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div>
      {msg && <Alert variant="info" className="login-alerta">{msg}</Alert>}
      {error && <Alert variant="danger" className="login-alerta">{error}</Alert>}

      <Form onSubmit={verificar} noValidate>
        <Form.Group className="mb-2" controlId="codigo">
          <Form.Label className="login-label">Código de verificación</Form.Label>
          <InputGroup>
            <InputGroup.Text className="login-icono-prefijo">
              <IconoCodigo />
            </InputGroup.Text>
            <Form.Control
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, ''))}
              disabled={cargando}
              className="verificar-codigo-input"
              autoFocus
              aria-label="Código de verificación"
            />
          </InputGroup>
        </Form.Group>

        <Button type="submit" className="login-boton w-100 mt-2" disabled={cargando}>
          {cargando
            ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Verificando...</>)
            : 'Verificar correo'}
        </Button>
      </Form>

      <p className="verificar-reenvio">
        ¿No te llegó?{' '}
        <button
          type="button"
          className="login-olvidar"
          onClick={reenviar}
          disabled={seg > 0 || reenviando}
        >
          {reenviando
            ? 'Enviando...'
            : seg > 0
              ? `Reenviar código (${seg}s)`
              : 'Reenviar código'}
        </button>
      </p>
    </div>
  );
}

export default VerificarCorreo;