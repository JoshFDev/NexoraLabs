import { useEffect, useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Chispas from '../components/Chispas';
import {
  leerUsuario,
  guardarUsuario,
  esPerfilCompleto,
  niveles,
  disponibilidades,
  interesesSugeridos,
  idiomasSugeridos,
} from '../utils/perfil';
import './LoginPage.css';
import './PerfilPage.css';

const pasos = ['Datos', 'Sobre ti', 'Colaboración', 'Educación'];

function PerfilPage() {
  const almacenado = leerUsuario();
  const [datos, setDatos] = useState({
    apellido_materno: almacenado?.apellido_materno || '',
    telefono: almacenado?.telefono || '',
    pais: almacenado?.pais || '',
    provincia: almacenado?.provincia || '',
    acerca_de_mi: almacenado?.acerca_de_mi || '',
    especialidad_principal: almacenado?.especialidad_principal || '',
    nivel_experiencia: almacenado?.nivel_experiencia || 'principiante',
    disponibilidad: almacenado?.disponibilidad || 'bajo_demanda',
    intereses: almacenado?.intereses || [],
    idiomas: almacenado?.idiomas || [],
    educacion: {
      institucion: almacenado?.educacion?.institucion || '',
      titulo: almacenado?.educacion?.titulo || '',
      en_curso: almacenado?.educacion?.en_curso || false,
    },
  });
  const [paso, setPaso] = useState(0);
  const [erroresPaso, setErroresPaso] = useState({});
  const [validando, setValidando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);
  const [chispas, setChispas] = useState(false);
  const [error, setError] = useState('');
  const [nuevoInteres, setNuevoInteres] = useState('');
  const [nuevoIdioma, setNuevoIdioma] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const perfil = (await api.get('/usuario/perfil')).data;
        guardarUsuario(perfil);
        setDatos({
          apellido_materno: perfil.apellido_materno || '',
          telefono: perfil.telefono || '',
          pais: perfil.pais || '',
          provincia: perfil.provincia || '',
          acerca_de_mi: perfil.acerca_de_mi || '',
          especialidad_principal: perfil.especialidad_principal || '',
          nivel_experiencia: perfil.nivel_experiencia || 'principiante',
          disponibilidad: perfil.disponibilidad || 'bajo_demanda',
          intereses: perfil.intereses || [],
          idiomas: perfil.idiomas || [],
          educacion: {
            institucion: perfil.educacion?.institucion || '',
            titulo: perfil.educacion?.titulo || '',
            en_curso: perfil.educacion?.en_curso || false,
          },
        });
      } catch (err) {
        setError(err.response?.data?.error || 'No pudimos cargar tu perfil.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const set = (campo) => (e) => {
    setDatos((p) => ({ ...p, [campo]: e.target.value }));
    setErroresPaso({});
  };

  const setEducacion = (campo) => (e) => {
    const valor = campo === 'en_curso' ? e.target.checked : e.target.value;
    setDatos((p) => ({ ...p, educacion: { ...p.educacion, [campo]: valor } }));
    setErroresPaso({});
  };

  const alternar = (lista, item) => {
    setDatos((p) => ({
      ...p,
      [lista]: p[lista].includes(item) ? p[lista].filter((i) => i !== item) : [...p[lista], item],
    }));
    setErroresPaso({});
  };

  const agregar = (lista, valor, limpiar) => {
    const v = valor.trim();
    if (v && !datos[lista].includes(v)) {
      setDatos((p) => ({ ...p, [lista]: [...p[lista], v] }));
    }
    limpiar('');
    setErroresPaso({});
  };

  const validarPaso = (p) => {
    const falta = {};
    if (p === 0) {
      if (!datos.apellido_materno.trim()) falta.apellido_materno = 'Ingresa tu apellido materno.';
      if (!datos.pais.trim()) falta.pais = 'Ingresa tu país.';
      if (!datos.provincia.trim()) falta.provincia = 'Ingresa tu provincia o estado.';
    }
    if (p === 1) {
      if (!datos.acerca_de_mi.trim()) falta.acerca_de_mi = 'Cuéntanos brevemente sobre ti.';
      if (!datos.especialidad_principal.trim()) falta.especialidad_principal = 'Indica tu especialidad principal.';
    }
    if (p === 2) {
      if (datos.intereses.length === 0) falta.intereses = 'Selecciona al menos un interés.';
      if (datos.idiomas.length === 0) falta.idiomas = 'Agrega al menos un idioma.';
    }
    if (p === 3) {
      if (!datos.educacion.institucion.trim()) falta.institucion = 'Indica tu institución.';
      if (!datos.educacion.titulo.trim()) falta.titulo = 'Indica tu título o carrera.';
    }
    return falta;
  };

  const continuar = () => {
    const falta = validarPaso(paso);
    if (Object.keys(falta).length > 0) {
      setErroresPaso(falta);
      setValidando(true);
      return;
    }
    setErroresPaso({});
    setValidando(false);
    setPaso((p) => p + 1);
  };

  const atras = () => {
    setValidando(false);
    setErroresPaso({});
    setPaso((p) => p - 1);
  };

  const guardar = async () => {
    let falta;
    for (let p = 0; p < pasos.length; p++) {
      falta = validarPaso(p);
      if (Object.keys(falta).length > 0) {
        setErroresPaso(falta);
        setPaso(p);
        setValidando(true);
        return;
      }
    }
    setErroresPaso({});
    setError('');
    setGuardando(true);
    try {
      const payload = {
        apellido_materno: datos.apellido_materno,
        telefono: datos.telefono,
        pais: datos.pais,
        provincia: datos.provincia,
        acerca_de_mi: datos.acerca_de_mi,
        nivel_experiencia: datos.nivel_experiencia,
        especialidad_principal: datos.especialidad_principal,
        disponibilidad: datos.disponibilidad,
        intereses: datos.intereses,
        idiomas: datos.idiomas,
        educacion: datos.educacion,
      };
      const perfil = (await api.put('/usuario/perfil', payload)).data;
      guardarUsuario(perfil);
      setListo(true);
      setGuardando(false);
      setTimeout(() => {
        setChispas(true);
        setTimeout(() => navigate('/'), 500);
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar tu perfil. Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="perfil-cargando">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const faltaActual = erroresPaso;

  return (
    <div className="perfil-pagina">
      {chispas && <Chispas />}

      <div className="login-tarjeta perfil-tarjeta">
        <div className="login-encabezado perfil-encabezado">
          <div className="perfil-titulo" style={{ marginBottom: '0.4rem' }}>
            <span className="perfil-badge">Paso {paso + 1} de {pasos.length}</span>
            <h1>Completa tu perfil</h1>
            <p>Desbloquea toda la plataforma</p>
          </div>
          <div className="perfil-progreso">
            {pasos.map((nombre, i) => (
              <div key={nombre} className={`perfil-paso ${i === paso ? 'activo' : ''} ${i < paso ? 'hecho' : ''}`}>
                <span className="perfil-paso-numero">{i < paso ? '✓' : i + 1}</span>
                <span className="perfil-paso-nombre">{nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="login-alerta">
            <strong>Error.</strong> {error}
          </Alert>
        )}

        <div key={paso} className="perfil-paso-contenido">
          {paso === 0 && (
            <>
              <div className="perfil-campo">
                <label className="login-label">Apellido materno</label>
                <input
                  className={`perfil-input ${faltaActual.apellido_materno ? 'login-control-invalido' : ''}`}
                  placeholder="Tu apellido materno"
                  value={datos.apellido_materno}
                  onChange={set('apellido_materno')}
                  autoFocus
                />
                {faltaActual.apellido_materno && <small className="login-error-campo">✕ {faltaActual.apellido_materno}</small>}
              </div>
              <div className="perfil-campo">
                <label className="login-label">Teléfono (opcional)</label>
                <input
                  className="perfil-input"
                  placeholder="+51 999 999 999"
                  value={datos.telefono}
                  onChange={set('telefono')}
                />
              </div>
              <div className="perfil-fila">
                <div className="perfil-campo">
                  <label className="login-label">País</label>
                  <input
                    className={`perfil-input ${faltaActual.pais ? 'login-control-invalido' : ''}`}
                    placeholder="Perú, México, España..."
                    value={datos.pais}
                    onChange={set('pais')}
                  />
                  {faltaActual.pais && <small className="login-error-campo">✕ {faltaActual.pais}</small>}
                </div>
                <div className="perfil-campo">
                  <label className="login-label">Provincia / Estado</label>
                  <input
                    className={`perfil-input ${faltaActual.provincia ? 'login-control-invalido' : ''}`}
                    placeholder="Lima, CDMX, Madrid..."
                    value={datos.provincia}
                    onChange={set('provincia')}
                  />
                  {faltaActual.provincia && <small className="login-error-campo">✕ {faltaActual.provincia}</small>}
                </div>
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <div className="perfil-campo">
                <label className="login-label">Sobre ti</label>
                <textarea
                  className={`perfil-input perfil-textarea ${faltaActual.acerca_de_mi ? 'login-control-invalido' : ''}`}
                  rows="3"
                  placeholder="Cuéntanos sobre tu experiencia, tus metas y qué buscas en NexoraLabs..."
                  value={datos.acerca_de_mi}
                  onChange={set('acerca_de_mi')}
                  autoFocus
                />
                {faltaActual.acerca_de_mi && <small className="login-error-campo">✕ {faltaActual.acerca_de_mi}</small>}
              </div>
              <div className="perfil-campo">
                <label className="login-label">Especialidad principal</label>
                <input
                  className={`perfil-input ${faltaActual.especialidad_principal ? 'login-control-invalido' : ''}`}
                  placeholder="Ej. Desarrollo Web, Machine Learning, Diseño UX/UI..."
                  value={datos.especialidad_principal}
                  onChange={set('especialidad_principal')}
                />
                {faltaActual.especialidad_principal && <small className="login-error-campo">✕ {faltaActual.especialidad_principal}</small>}
              </div>
              <div className="perfil-fila">
                <div className="perfil-campo">
                  <label className="login-label">Nivel de experiencia</label>
                  <select className="perfil-input perfil-select" value={datos.nivel_experiencia} onChange={set('nivel_experiencia')}>
                    {niveles.map((n) => (
                      <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="perfil-campo">
                  <label className="login-label">Disponibilidad</label>
                  <select className="perfil-input perfil-select" value={datos.disponibilidad} onChange={set('disponibilidad')}>
                    {disponibilidades.map((d) => (
                      <option key={d} value={d}>{d.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <div className="perfil-campo">
                <label className="login-label">Intereses</label>
                <div className="perfil-chips">
                  {interesesSugeridos.map((i) => (
                    <button
                      type="button"
                      key={i}
                      className={`perfil-chip ${datos.intereses.includes(i) ? 'perfil-chip-activo' : ''}`}
                      onClick={() => alternar('intereses', i)}
                    >
                      {i}
                    </button>
                  ))}
                  {datos.intereses.filter((i) => !interesesSugeridos.includes(i)).map((i) => (
                    <button
                      type="button"
                      key={i}
                      className="perfil-chip perfil-chip-activo"
                      onClick={() => alternar('intereses', i)}
                    >
                      {i} ✕
                    </button>
                  ))}
                </div>
                <form className="perfil-agregar" onSubmit={(e) => { e.preventDefault(); agregar('intereses', nuevoInteres, setNuevoInteres); }}>
                  <input
                    className="perfil-input"
                    placeholder="Otro interés..."
                    value={nuevoInteres}
                    onChange={(e) => setNuevoInteres(e.target.value)}
                  />
                  <Button type="submit" variant="outline-light" size="sm" className="perfil-agregar-btn">+</Button>
                </form>
                {faltaActual.intereses && <small className="login-error-campo">✕ {faltaActual.intereses}</small>}
              </div>

              <div className="perfil-campo">
                <label className="login-label">Idiomas</label>
                <div className="perfil-chips">
                  {idiomasSugeridos.map((i) => (
                    <button
                      type="button"
                      key={i}
                      className={`perfil-chip ${datos.idiomas.includes(i) ? 'perfil-chip-activo' : ''}`}
                      onClick={() => alternar('idiomas', i)}
                    >
                      {i}
                    </button>
                  ))}
                  {datos.idiomas.filter((i) => !idiomasSugeridos.includes(i)).map((i) => (
                    <button
                      type="button"
                      key={i}
                      className="perfil-chip perfil-chip-activo"
                      onClick={() => alternar('idiomas', i)}
                    >
                      {i} ✕
                    </button>
                  ))}
                </div>
                <form className="perfil-agregar" onSubmit={(e) => { e.preventDefault(); agregar('idiomas', nuevoIdioma, setNuevoIdioma); }}>
                  <input
                    className="perfil-input"
                    placeholder="Otro idioma..."
                    value={nuevoIdioma}
                    onChange={(e) => setNuevoIdioma(e.target.value)}
                  />
                  <Button type="submit" variant="outline-light" size="sm" className="perfil-agregar-btn">+</Button>
                </form>
                {faltaActual.idiomas && <small className="login-error-campo">✕ {faltaActual.idiomas}</small>}
              </div>
            </>
          )}

          {paso === 3 && (
            <>
              <div className="perfil-campo">
                <label className="login-label">Institución educativa</label>
                <input
                  className={`perfil-input ${faltaActual.institucion ? 'login-control-invalido' : ''}`}
                  placeholder="Universidad, instituto, bootcamp..."
                  value={datos.educacion.institucion}
                  onChange={setEducacion('institucion')}
                  autoFocus
                />
                {faltaActual.institucion && <small className="login-error-campo">✕ {faltaActual.institucion}</small>}
              </div>
              <div className="perfil-campo">
                <label className="login-label">Título o carrera</label>
                <input
                  className={`perfil-input ${faltaActual.titulo ? 'login-control-invalido' : ''}`}
                  placeholder="Ing. Sistemas, Bootcamp Full Stack, Autodidacta..."
                  value={datos.educacion.titulo}
                  onChange={setEducacion('titulo')}
                />
                {faltaActual.titulo && <small className="login-error-campo">✕ {faltaActual.titulo}</small>}
              </div>
              <div className="perfil-campo perfil-chequeo">
                <label className="perfil-check">
                  <input
                    type="checkbox"
                    checked={datos.educacion.en_curso}
                    onChange={setEducacion('en_curso')}
                  />
                  Actualmente cursando
                </label>
              </div>
            </>
          )}
        </div>

        {listo ? (
          <Button type="button" className="login-boton w-100 mt-3" disabled>
            <span className="login-exito-icono">✓</span>¡Perfil completo!
          </Button>
        ) : (
          <div className="perfil-acciones">
            {paso > 0 && (
              <Button type="button" variant="outline-light" className="perfil-atras" onClick={atras} disabled={guardando}>
                Atrás
              </Button>
            )}
            {paso < pasos.length - 1 ? (
              <Button type="button" className="login-boton perfil-siguiente" onClick={continuar}>
                Continuar
              </Button>
            ) : (
              <Button type="button" className="login-boton perfil-siguiente" onClick={guardar} disabled={guardando}>
                {guardando
                  ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</>)
                  : 'Guardar y terminar'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilPage;