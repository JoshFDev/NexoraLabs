import { useEffect, useState } from 'react';
import { Modal, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './EliminarCuentaModal.css';

// Modal que pide el código enviado al correo para eliminar la cuenta.
// Al abrirse, solicita el código automáticamente (POST /usuario/eliminar/solicitar).
function EliminarCuentaModal({ mostrar, onCerrar }) {
  const [codigo, setCodigo] = useState('');
  const [msj, setMsj] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mostrar) return;
    setCodigo('');
    setMsj('');
    setError('');
    setEnviado(false);
    const pedir = async () => {
      setCargando(true);
      try {
        await api.post('/usuario/eliminar/solicitar');
        setMsj('Te enviamos un código de confirmación a tu correo.');
        setEnviado(true);
      } catch (err) {
        setError(err.response?.data?.error || 'No pudimos enviar el código. Inténtalo de nuevo.');
      } finally {
        setCargando(false);
      }
    };
    pedir();
  }, [mostrar]);

  const confirmar = async () => {
    if (codigo.length !== 6) return;
    setError('');
    setConfirmando(true);
    try {
      await api.post('/usuario/eliminar/confirmar', { codigo });
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos eliminar tu cuenta. Inténtalo de nuevo.');
      setConfirmando(false);
    }
  };

  return (
    <Modal show={mostrar} onHide={onCerrar} centered>
      <Modal.Header closeButton className="border-0 px-4 pt-4">
        <Modal.Title className="proyectos-titulo">Eliminar mi cuenta</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <p className="proyectos-subtitulo">
          Esta acción es permanente: se borran tu cuenta y todo tu contenido (proyectos, postulaciones,
          comentarios, membresías, etc.).
        </p>
        {cargando && (
          <div className="eliminar-cargando">
            <Spinner as="span" animation="border" size="sm" className="me-2" />
            Enviando código...
          </div>
        )}
        {enviado && <Alert variant="success" className="eliminar-aviso">{msj}</Alert>}
        {error && <Alert variant="danger" className="eliminar-aviso">{error}</Alert>}

        {enviado && (
          <>
            <Form.Control
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, ''))}
              className="perfil-eliminar-input"
              autoFocus
            />
            <div className="d-flex justify-content-center gap-3 mt-3">
              <Button
                variant="danger"
                className="proyectos-boton"
                onClick={confirmar}
                disabled={confirmando || codigo.length !== 6}
              >
                {confirmando && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                Eliminar definitivamente
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

export default EliminarCuentaModal;