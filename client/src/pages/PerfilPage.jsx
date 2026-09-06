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
import PerfilEditar from './PerfilEditar';

const pasos = ['Datos', 'Sobre ti', 'Colaboración', 'Educación', 'Habilidades'];

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
    habilidades: [],
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
  const [habilidadesCatalogo, setHabilidadesCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [misHabilidades, setMisHabilidades] = useState([]);
  const [buscarHabilidad, setBuscarHabilidad] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const [perfil, mis] = await Promise.all([
          api.get('/usuario/perfil'),
          api.get('/mis-habilidades'),
        ]);
        const p = perfil.data;
        guardarUsuario(p);
        setMisHabilidades(mis.data || []);
        setDatos({
          apellido_materno: p.apellido_materno || '',
          telefono: p.telefono || '',
          pais: p.pais || '',
          provincia: p.provincia || '',
          acerca_de_mi: p.acerca_de_mi || '',
          especialidad_principal: p.especialidad_principal || '',
          nivel_experiencia: p.nivel_experiencia || 'principiante',
          disponibilidad: p.disponibilidad || 'bajo_demanda',
          intereses: p.intereses || [],
          idiomas: p.idiomas || [],
          educacion: {
            institucion: p.educacion?.institucion || '',
            titulo: p.educacion?.titulo || '',
            en_curso: p.educacion?.en_curso || false,
          },
          habilidades: (mis.data || []).map((r) => ({
            habilidad_id: String(r.habilidad_id?._id || r.habilidad_id),
            nivel: r.nivel || 'principiante',
          })),
        });
      } catch (err) {
        setError(err.response?.data?.error || 'No pudimos cargar tu perfil.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    api
      .get('/habilidades?limite=500')
      .then((res) => setHabilidadesCatalogo(res.data.habilidades || []))
      .catch(() => setHabilidadesCatalogo([]))
      .finally(() => setCargandoCatalogo(false));
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

  const alternarHabilidad = (h) => {
    setDatos((p) => {
      const yaExiste = p.habilidades.some((s) => String(s.habilidad_id) === String(h._id));
      return {
        ...p,
        habilidades: yaExiste
          ? p.habilidades.filter((s) => String(s.habilidad_id) !== String(h._id))
          : [...p.habilidades, { habilidad_id: String(h._id), nivel: 'principiante' }],
      };
    });
    setErroresPaso({});
  };

  const cambiarNivel = (id, nivel) => {
    setDatos((p) => ({
      ...p,
      habilidades: p.habilidades.map((s) =>
        String(s.habilidad_id) === String(id) ? { ...s, nivel } : s
      ),
    }));
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
    if (p === 4) {
      if (datos.habilidades.length === 0 && habilidadesCatalogo.length > 0) {
        falta.habilidades = 'Indica al menos una habilidad que domines.';
      }
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
      const miId = String(perfil._id || perfil.id);
      const idsDeseadas = datos.habilidades.map((s) => String(s.habilidad_id));
      await Promise.all(
        datos.habilidades.map((s) =>
          api.post('/usuario-habilidad/agregar', {
            usuario_id: miId,
            habilidad_id: s.habilidad_id,
            nivel: s.nivel,
          })
        )
      );
      await Promise.all(
        misHabilidades
          .filter((r) => !idsDeseadas.includes(String(r.habilidad_id?._id || r.habilidad_id)))
          .map((r) => api.delete(`/usuario-habilidad/${r._id}`))
      );
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

  if (esPerfilCompleto(leerUsuario())) {
    return <PerfilEditar />;
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

          {paso === 4 && (
            <>
              <div className="perfil-campo">
                <label className="login-label">Habilidades que dominas</label>
                <input
                  className="perfil-input"
                  placeholder="Buscar en el catálogo..."
                  value={buscarHabilidad}
                  onChange={(e) => setBuscarHabilidad(e.target.value)}
                />
                {cargandoCatalogo ? (
                  <div className="perfil-cargando mt-2 text-center">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : habilidadesCatalogo.length === 0 ? (
                  <small className="login-error-campo">El catálogo aún no tiene habilidades registradas.</small>
                ) : (
                  <div className="perfil-chips">
                    {habilidadesCatalogo
                      .filter((h) => !datos.habilidades.some((s) => String(s.habilidad_id) === String(h._id)))
                      .filter((h) =>
                        h.nombre.toLowerCase().includes(buscarHabilidad.trim().toLowerCase())
                      )
                      .map((h) => (
                        <button
                          type="button"
                          key={String(h._id)}
                          className="perfil-chip"
                          onClick={() => alternarHabilidad(h)}
                        >
                          {h.nombre}
                        </button>
                      ))}
                    {habilidadesCatalogo.filter(
                      (h) =>
                        !datos.habilidades.some((s) => String(s.habilidad_id) === String(h._id)) &&
                        h.nombre.toLowerCase().includes(buscarHabilidad.trim().toLowerCase())
                    ).length === 0 && (
                      <small className="proyectos-subtitulo">No hay más habilidades con ese filtro.</small>
                    )}
                  </div>
                )}
                {faltaActual.habilidades && (
                  <small className="login-error-campo">✕ {faltaActual.habilidades}</small>
                )}
              </div>

              <div className="perfil-campo">
                <label className="login-label">Tus habilidades declaradas</label>
                {datos.habilidades.length === 0 ? (
                  <small className="proyectos-subtitulo">
                    Selecciona arriba las habilidades con las que cuentas.
                  </small>
                ) : (
                  <div className="perfil-habilidades-lista">
                    {datos.habilidades.map((s) => {
                      const h = habilidadesCatalogo.find(
                        (x) => String(x._id) === String(s.habilidad_id)
                      );
                      return (
                        <div className="perfil-habilidad" key={s.habilidad_id}>
                          <button
                            type="button"
                            className="perfil-chip perfil-chip-activo"
                            onClick={() => alternarHabilidad(h || { _id: s.habilidad_id })}
                          >
                            {h?.nombre || 'Habilidad'} ✕
                          </button>
                          <select
                            className="perfil-input perfil-select perfil-habilidad-nivel"
                            value={s.nivel}
                            onChange={(e) => cambiarNivel(s.habilidad_id, e.target.value)}
                          >
                            {niveles.map((n) => (
                              <option key={n} value={n}>
                                {n.charAt(0).toUpperCase() + n.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
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