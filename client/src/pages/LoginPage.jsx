import { useRef, useState } from 'react';
import { Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Chispas from '../components/Chispas';
import VerificarCorreo from '../components/VerificarCorreo';
import { guardarUsuario, esPerfilCompleto } from '../utils/perfil';
import './LoginPage.css';

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

const IconoGoogle = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A12.03 12.03 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const IconoLinkedIn = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

const IconoGitHub = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.56v-2.03c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.18 1.77 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.05.78 2.13v3.16c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
  </svg>
);

function guardarSesion({ token, usuario, recordarme }) {
  const almacen = recordarme ? localStorage : sessionStorage;
  almacen.setItem('token', token);
  almacen.setItem('usuario', JSON.stringify(usuario));
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [capsActivo, setCapsActivo] = useState(false);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);
  const [agitar, setAgitar] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [errores, setErrores] = useState({ email: '', password: '' });
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const emailValido = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validarCampos = () => {
    const campos = { email: '', password: '' };
    if (!email.trim()) campos.email = 'Ingresa tu correo electrónico.';
    else if (!emailValido) campos.email = 'Formato de correo no válido.';
    if (!password) campos.password = 'Ingresa tu contraseña.';
    else if (password.length < 6) campos.password = 'Debe tener al menos 6 caracteres.';
    return campos;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNota('');
    const campos = validarCampos();
    if (campos.email || campos.password) {
      setErrores(campos);
      setAgitar(true);
      setTimeout(() => setAgitar(false), 500);
      if (campos.email) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }
    setErrores({ email: '', password: '' });
    setCargando(true);
    try {
      const res = await Promise.all([
        api.post('/usuario/login', { email, password }),
        new Promise((r) => setTimeout(r, 550)),
      ]).then(([resp]) => resp);
      guardarSesion({ ...res.data, recordarme });
      let perfil = null;
      try {
        perfil = (await api.get('/usuario/perfil')).data;
      } catch {
        perfil = null;
      }
      if (perfil) guardarUsuario(perfil);
      setListo(true);
      setCargando(false);
      setTimeout(() => navigate(perfil && !esPerfilCompleto(perfil) ? '/perfil' : '/'), 650);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('');
        setVerificando(true);
        setCargando(false);
        return;
      }
      setError(
        err.response
          ? 'Usuario o contraseña incorrectos.'
          : 'No pudimos conectar con el servidor. Inténtalo de nuevo.'
      );
      setErrores({ email: '', password: '' });
      setAgitar(true);
      setTimeout(() => setAgitar(false), 500);
      setCargando(false);
      emailRef.current?.focus();
    }
  };

  const verificado = async ({ token, usuario }) => {
    guardarSesion({ token, usuario, recordarme });
    let perfil = null;
    try {
      perfil = (await api.get('/usuario/perfil')).data;
    } catch {
      perfil = null;
    }
    if (perfil) guardarUsuario(perfil);
    setListo(true);
    setCargando(false);
    setTimeout(() => navigate(perfil && !esPerfilCompleto(perfil) ? '/perfil' : '/'), 650);
  };

  const autocompletar = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setNota('');
    setErrores({ email: '', password: '' });
  };

  const social = (proveedor) => {
    setNota(`La autenticación con ${proveedor} estará disponible próximamente.`);
  };

  const olvidar = () => {
    setNota('La recuperación de contraseña estará disponible próximamente.');
  };

  const irARegistro = (e) => {
    e.preventDefault();
    setCerrando(true);
    setTimeout(() => navigate('/registro'), 460);
  };

  const detectarCaps = (e) => {
    setCapsActivo(e.getModifierState && e.getModifierState('CapsLock'));
  };

  return (
    <div className="login-pagina">
      <div className="login-fondo">
        <span className="login-blob blob-u"></span>
        <span className="login-blob blob-d"></span>
        <span className="login-blob blob-l"></span>
        <span className="login-granulado"></span>
        <span className="login-vineta"></span>
      </div>

      {cerrando && <Chispas />}

      <main className={cerrando ? 'login-tarjeta login-tarjeta-cerrar' : 'login-tarjeta'}>
        <div className="login-encabezado">
          <div
            className="login-firma"
            role="img"
            aria-label="NexoraLabs"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
          />
          <h1>{verificando ? 'Verifica tu correo' : 'Bienvenido'}</h1>
          {verificando ? (
            <p className="login-subtitulo">
              Tu cuenta aún no está activa. Ingresa el código que enviamos a <strong>{email}</strong>.
            </p>
          ) : (
            <p>Inicia sesión para acceder a NexoraLabs</p>
          )}
        </div>

        {error && !verificando && (
          <Alert variant="danger" className="login-alerta">
            <strong>No pudimos iniciar sesión.</strong> {error}
          </Alert>
        )}

        {verificando ? (
          <VerificarCorreo email={email} onVerificado={verificado} yaEnviado />
        ) : (
        <Form onSubmit={submit} className={agitar ? 'login-agitar' : ''} noValidate>
          <Form.Group className="mb-2" controlId="email">
            <Form.Label className="login-label">Correo electrónico</Form.Label>
            <InputGroup>
              <InputGroup.Text className="login-icono-prefijo">
                <IconoCorreo />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errores.email) setErrores((p) => ({ ...p, email: '' }));
                }}
                autoComplete="email"
                ref={emailRef}
                autoFocus
                disabled={cargando || listo}
                className={errores.email ? 'login-control-invalido' : ''}
                aria-invalid={!!errores.email}
                required
              />
              {email && (
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

          <Form.Group className="mb-1" controlId="password">
            <Form.Label className="login-label">Contraseña</Form.Label>
            <InputGroup>
              <InputGroup.Text className="login-icono-prefijo">
                <IconoCandado />
              </InputGroup.Text>
              <Form.Control
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errores.password) setErrores((p) => ({ ...p, password: '' }));
                }}
                onKeyUp={detectarCaps}
                autoComplete="current-password"
                ref={passwordRef}
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
            {errores.password && (
              <Form.Text className="login-error-campo" role="alert">
                <IconoEstado valido={false} /> {errores.password}
              </Form.Text>
            )}
          </Form.Group>
          {capsActivo && (
            <small className="login-aviso-caps">⚠ La tecla Bloq Mayús está activada</small>
          )}
          {password && password.length < 6 && (
            <small className="login-aviso-minimo">La contraseña debe tener al menos 6 caracteres</small>
          )}

          <div className="login-extras">
            <Form.Check
              type="checkbox"
              id="recordarme"
              label="Recordarme"
              checked={recordarme}
              onChange={(e) => setRecordarme(e.target.checked)}
              className="login-recordarme"
            />
            <button type="button" className="login-olvidar" onClick={olvidar}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button type="submit" className="login-boton w-100 mt-3" disabled={cargando || listo}>
            {listo
              ? (<><span className="login-exito-icono">✓</span>¡Bienvenido!</>)
              : cargando
                ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Verificando...</>)
                : 'Iniciar sesión'}
          </Button>
        </Form>
        )}

        {!verificando && nota && <small className="login-social-nota">{nota}</small>}

        {!verificando && (<div className="login-social">
          <div className="login-divisor">
            <span>o continúa con</span>
          </div>
          <div className="login-social-redes">
            <Button variant="outline-light" onClick={() => social('Google')} aria-label="Iniciar sesión con Google">
              <IconoGoogle /> Google
            </Button>
            <Button variant="outline-light" onClick={() => social('LinkedIn')} aria-label="Iniciar sesión con LinkedIn">
              <IconoLinkedIn /> LinkedIn
            </Button>
            <Button variant="outline-light" onClick={() => social('GitHub')} aria-label="Iniciar sesión con GitHub">
              <IconoGitHub /> GitHub
            </Button>
          </div>
        </div>)}

        {!verificando && (<div className="login-demo">
          <span className="login-demo-titulo">Cuentas de prueba</span>
          <div className="login-demo-opciones">
            <button type="button" className="login-chipe" onClick={() => autocompletar('joshua@test.com', '123456')}>
              Estudiante
            </button>
            <button type="button" className="login-chipe" onClick={() => autocompletar('admin@test.com', '12345678')}>
              Admin
            </button>
          </div>
        </div>)}

        <p className="login-registro">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="login-enlace-boton" onClick={irARegistro}>
            Crea una
          </a>
        </p>
      </main>

      <footer className="login-pie">© 2026 NexoraLabs · Plataforma de proyectos colaborativos</footer>
    </div>
  );
}

export default LoginPage;