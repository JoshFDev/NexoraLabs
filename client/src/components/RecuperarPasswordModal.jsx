import { useEffect, useState } from 'react';
import { Modal, Button, Alert, Spinner, Form } from 'react-bootstrap';
import api from '../api';
import electronicaJpg from '../assets/Electronica.jpg';
import './RecuperarPasswordModal.css';

// Modal para restablecer la contraseña olvidada.
// Paso 1: pedir el código (POST /usuario/recuperar/solicitar).
// Paso 2: escribir el código y la nueva contraseña (POST /usuario/recuperar/confirmar).
function RecuperarPasswordModal({ mostrar, onCerrar, emailInicial = '' }) {
  const [email, setEmail] = useState(emailInicial);
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [repitePassword, setRepitePassword] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!mostrar) return;
    setEmail(emailInicial);
    setCodigo('');
    setNuevaPassword('');
    setRepitePassword('');
    setEnviado(false);
    setListo(false);
    setError('');
  }, [mostrar, emailInicial]);

  const emailValido = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const solicitar = async () => {
    if (!emailValido) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await api.post('/usuario/recuperar/solicitar', { email });
      setEnviado(true);
      setCargando(false);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos enviar el código. Inténtalo de nuevo.');
      setCargando(false);
    }
  };

  const validarPassword = () => {
    if (nuevaPassword.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (nuevaPassword !== repitePassword) return 'Las contraseñas no coinciden.';
    return '';
  };

  const confirmar = async () => {
    const invalida = validarPassword();
    if (codigo.length !== 6 || invalida) {
      setError(invalida || 'Ingresa el código de 6 dígitos que recibiste.');
      return;
    }
    setError('');
    setConfirmando(true);
    try {
      await api.post('/usuario/recuperar/confirmar', { email, codigo, nueva_password: nuevaPassword });
      setConfirmando(false);
      setListo(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos restablecer tu contraseña. Inténtalo de nuevo.');
      setConfirmando(false);
    }
  };

  return (
    <Modal show={mostrar} onHide={onCerrar} centered dialogClassName="recuperar-modal-dialog" className="recuperar-modal">
      <Modal.Header closeButton className="border-0 px-4 pt-4">
        <Modal.Title className="proyectos-titulo">Recuperar contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <div className="recuperar-banner">
          <img src={electronicaJpg} alt="" aria-hidden="true" />
        </div>
        {listo ? (
          <>
            <Alert variant="success" className="recuperar-aviso">
              Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña.
            </Alert>
            <div className="d-flex justify-content-center mt-3">
              <Button variant="outline-light" className="proyectos-boton" onClick={onCerrar}>
                Entendido
              </Button>
            </div>
          </>
        ) : !enviado ? (
          <>
            <p className="proyectos-subtitulo">
              Te enviaremos un código a tu correo para verificar que eres tú. Si la cuenta existe, recibirás el correo
              en unos momentos.
            </p>
            <Form.Control
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            {error && (
              <Alert variant="danger" className="recuperar-aviso">
                {error}
              </Alert>
            )}
            <div className="d-flex justify-content-center gap-3 mt-3">
              <Button
                variant="primary"
                className="proyectos-boton"
                onClick={solicitar}
                disabled={cargando || !emailValido}
              >
                {cargando && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                Enviar código
              </Button>
              <Button variant="outline-light" className="proyectos-boton" onClick={onCerrar}>
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert variant="success" className="recuperar-aviso">
              Revisa tu correo: te enviamos un código de 6 dígitos. Escríbelo junto con tu nueva contraseña.
            </Alert>
            <Form.Control
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.replace(/[^0-9]/g, ''));
                if (error) setError('');
              }}
              className="perfil-eliminar-input"
              autoFocus
            />
            <Form.Control
              type="password"
              placeholder="Nueva contraseña (mínimo 8 caracteres)"
              value={nuevaPassword}
              onChange={(e) => {
                setNuevaPassword(e.target.value);
                if (error) setError('');
              }}
              className="mt-2"
            />
            <Form.Control
              type="password"
              placeholder="Repite la nueva contraseña"
              value={repitePassword}
              onChange={(e) => {
                setRepitePassword(e.target.value);
                if (error) setError('');
              }}
              className="mt-2"
            />
            {error && (
              <Alert variant="danger" className="recuperar-aviso">
                {error}
              </Alert>
            )}
            <div className="d-flex justify-content-center gap-3 mt-3">
              <Button
                variant="primary"
                className="proyectos-boton"
                onClick={confirmar}
                disabled={confirmando || codigo.length !== 6 || nuevaPassword.length < 8}
              >
                {confirmando && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                Restablecer contraseña
              </Button>
              <Button variant="outline-light" className="proyectos-boton" onClick={onCerrar}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default RecuperarPasswordModal;
