import { useRef, useState } from 'react';
import { Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Chispas from '../components/Chispas';
import './LoginPage.css';
import './RegistroPage.css';

const IconoNombre = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);

const IconoApellido = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <circle cx="10.5" cy="10.5" r="2" />
    <path d="M7 17c.6-2 1.8-3 3.5-3s2.9 1 3.5 3" />
  </svg>
);

const IconoRol = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);

const IconoCorreo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const IconoCandado = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
    <rect x="4" y="10.5" width="16" height="10.5" rx="2" />
    <path d="M8 10.5V7a4 4 0 018 0v3.5" />
  </svg>
);

const IconoOjo = ({ abierto }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="19" height="19">
    {abierto ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </>
    )}
  </svg>
);

const IconoEstado = ({ valido }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16">
    {valido ? (
      <path d="M5 13l4 4 10-10" />
    ) : (
      <path d="M6 6l12 12M18 6L6 18" />
    )}
  </svg>
);

const roles = ['estudiante', 'desarrollador', 'ingeniero', 'mentor'];

function RegistroPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellido_paterno: '',
    email: '',
    password: '',
    rol: 'estudiante',
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [capsActivo, setCapsActivo] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);
  const [agitar, setAgitar] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [errores, setErrores] = useState({ nombre: '', apellido_paterno: '', email: '', password: '' });
  const emailRef = useRef(null);
  const navigate = useNavigate();

  const emailValido = form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const cambiar = (campo) => (e) => {
    setForm((p) => ({ ...p, [campo]: e.target.value }));
    if (errores[campo]) setErrores((p) => ({ ...p, [campo]: '' }));
  };

  const validarCampos = () => {
    const campos = { nombre: '', apellido_paterno: '', email: '', password: '' };
    if (!form.nombre.trim()) campos.nombre = 'Ingresa tu nombre.';
    if (!form.apellido_paterno.trim()) campos.apellido_paterno = 'Ingresa tu apellido.';
    if (!form.email.trim()) campos.email = 'Ingresa tu correo electrónico.';
    else if (!emailValido) campos.email = 'Formato de correo no válido.';
    if (!form.password) campos.password = 'Ingresa una contraseña.';
    else if (form.password.length < 8) campos.password = 'Debe tener al menos 8 caracteres.';
    return campos;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const campos = validarCampos();
    if (campos.nombre || campos.apellido_paterno || campos.email || campos.password) {
      setErrores(campos);
      setAgitar(true);
      setTimeout(() => setAgitar(false), 500);
      emailRef.current?.focus();
      return;
    }
    setErrores({ nombre: '', apellido_paterno: '', email: '', password: '' });
    setCargando(true);
    try {
      await api.post('/usuario/registro', form);
      setListo(true);
      setCargando(false);
      setTimeout(() => {
        setCerrando(true);
        setTimeout(() => navigate('/login'), 460);
      }, 750);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos crear tu cuenta. Inténtalo de nuevo.');
      setAgitar(true);
      setTimeout(() => setAgitar(false), 500);
      setCargando(false);
    }
  };

  const detectarCaps = (e) => {
    setCapsActivo(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const irALogin = (e) => {
    e.preventDefault();
    setCerrando(true);
    setTimeout(() => navigate('/login'), 460);
  };

  return (
    <div className="login-pagina">
      <div className="login-fondo registro-fondo">
        <span className="login-blob blob-u"></span>
        <span className="login-blob blob-d"></span>
        <span className="login-blob blob-l"></span>
        <span className="login-granulado"></span>
        <span className="login-vineta"></span>
      </div>

      {cerrando && <Chispas />}
      <span className="login-destello"></span>

      <main className={cerrando ? 'login-tarjeta login-tarjeta-cerrar' : 'login-tarjeta'}>
        <div className="login-encabezado">
          <div
            className="registro-firma"
            role="img"
            aria-label="NexoraLabs — Conecta, aprende, crea, avanza"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
          />
          <h1>Crea tu cuenta</h1>
        </div>

        {error && (
          <Alert variant="danger" className="login-alerta">
            <strong>No pudimos crear tu cuenta.</strong> {error}
          </Alert>
        )}

        <Form onSubmit={submit} className={agitar ? 'login-agitar' : ''} noValidate>
          <div className="registro-fila">
            <Form.Group className="mb-2" controlId="nombre">
              <Form.Label className="login-label">Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={cambiar('nombre')}
                autoComplete="given-name"
                autoFocus
                disabled={cargando || listo}
                className={errores.nombre ? 'login-control-invalido' : ''}
                aria-invalid={!!errores.nombre}
                required
              />
              {errores.nombre && (
                <Form.Text className="login-error-campo" role="alert">
                  <IconoEstado valido={false} /> {errores.nombre}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-2" controlId="apellido_paterno">
              <Form.Label className="login-label">Apellido</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tu apellido"
                value={form.apellido_paterno}
                onChange={cambiar('apellido_paterno')}
                autoComplete="family-name"
                disabled={cargando || listo}
                className={errores.apellido_paterno ? 'login-control-invalido' : ''}
                aria-invalid={!!errores.apellido_paterno}
                required
              />
              {errores.apellido_paterno && (
                <Form.Text className="login-error-campo" role="alert">
                  <IconoEstado valido={false} /> {errores.apellido_paterno}
                </Form.Text>
              )}
            </Form.Group>
          </div>

          <Form.Group className="mb-2" controlId="email">
            <Form.Label className="login-label">Correo electrónico</Form.Label>
            <InputGroup>
              <InputGroup.Text className="login-icono-prefijo">
                <IconoCorreo />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={form.email}
                onChange={cambiar('email')}
                autoComplete="email"
                ref={emailRef}
                disabled={cargando || listo}
                className={errores.email ? 'login-control-invalido' : ''}
                aria-invalid={!!errores.email}
                required
              />
              {form.email && (
                <InputGroup.Text className={emailValido ? 'login-estado-valido' : 'login-estado-invalido'}>
                  <IconoEstado valido={emailValido} />
                </InputGroup.Text>
              )}
            </InputGroup>
            {errores.email && (
              <Form.Text className="login-error-campo" role="alert">
                <IconoEstado valido={false} /> {errores.email}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-2" controlId="password">
            <Form.Label className="login-label">Contraseña</Form.Label>
            <InputGroup>
              <InputGroup.Text className="login-icono-prefijo">
                <IconoCandado />
              </InputGroup.Text>
              <Form.Control
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={cambiar('password')}
                onKeyUp={detectarCaps}
                autoComplete="new-password"
                disabled={cargando || listo}
                className={errores.password ? 'login-control-invalido' : ''}
                aria-invalid={!!errores.password}
                required
              />
              <Button
                variant="outline-light"
                className="login-toggle-password"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                disabled={cargando || listo}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <IconoOjo abierto={mostrarPassword} />
              </Button>
            </InputGroup>
            {capsActivo && (
              <small className="login-aviso-caps">⚠ La tecla Bloq Mayús está activada</small>
            )}
            {form.password && form.password.length < 8 && (
              <small className="login-aviso-minimo">La contraseña debe tener al menos 8 caracteres</small>
            )}
            {errores.password && (
              <Form.Text className="login-error-campo" role="alert">
                <IconoEstado valido={false} /> {errores.password}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-1" controlId="rol">
            <Form.Label className="login-label">Perfil</Form.Label>
            <InputGroup>
              <InputGroup.Text className="login-icono-prefijo">
                <IconoRol />
              </InputGroup.Text>
              <Form.Select
                value={form.rol}
                onChange={cambiar('rol')}
                className="login-select"
                disabled={cargando || listo}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Form.Group>

          <Button type="submit" className="login-boton w-100 mt-3" disabled={cargando || listo}>
            {listo
              ? (<><span className="login-exito-icono">✓</span>¡Cuenta creada!</>)
              : cargando
                ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Creando cuenta...</>)
                : 'Crear cuenta'}
          </Button>
        </Form>

        <p className="login-registro">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="login-enlace-boton" onClick={irALogin}>
            Inicia sesión
          </a>
        </p>
      </main>

      <footer className="login-pie">© 2026 NexoraLabs · Plataforma de proyectos colaborativos</footer>
    </div>
  );
}

export default RegistroPage;