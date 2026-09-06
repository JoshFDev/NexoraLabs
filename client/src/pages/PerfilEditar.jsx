import { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api';
import {
  leerUsuario,
  guardarUsuario,
  niveles,
  disponibilidades,
  interesesSugeridos,
  idiomasSugeridos,
} from '../utils/perfil';
import './PerfilPage.css';

const ROL_LABEL = {
  admin: 'Administrador',
  estudiante: 'Estudiante',
  desarrollador: 'Desarrollador',
  ingeniero: 'Ingeniero',
  mentor: 'Mentor / Docente',
};

const TAMANO_FOTO = 256;

const NIVEL_LABEL = {
  principiante: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const DISP_LABEL = {
  tiempo_completo: 'Tiempo completo',
  medio_tiempo: 'Medio tiempo',
  fines_de_semana: 'Fines de semana',
  bajo_demanda: 'Bajo demanda',
};

function PerfilEditar() {
  const almacenado = leerUsuario();
  const inputFotoRef = useRef(null);

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
    foto: almacenado?.foto || '',
    habilidades: [],
  });
  const [misHabilidades, setMisHabilidades] = useState([]);
  const [habilidadesCatalogo, setHabilidadesCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [buscarHabilidad, setBuscarHabilidad] = useState('');
  const [nuevoInteres, setNuevoInteres] = useState('');
  const [nuevoIdioma, setNuevoIdioma] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [errorFoto, setErrorFoto] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [perfil, mis] = await Promise.all([
          api.get('/usuario/perfil'),
          api.get('/mis-habilidades'),
        ]);
        const p = perfil.data;
        guardarUsuario(p);
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
          foto: p.foto || '',
          habilidades: (mis.data || []).map((r) => ({
            habilidad_id: String(r.habilidad_id?._id || r.habilidad_id),
            nivel: r.nivel || 'principiante',
          })),
        });
        setMisHabilidades(mis.data || []);
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
  };

  const setEducacion = (campo) => (e) => {
    const valor = campo === 'en_curso' ? e.target.checked : e.target.value;
    setDatos((p) => ({ ...p, educacion: { ...p.educacion, [campo]: valor } }));
  };

  const alternar = (lista, item) => {
    setDatos((p) => ({
      ...p,
      [lista]: p[lista].includes(item) ? p[lista].filter((i) => i !== item) : [...p[lista], item],
    }));
  };

  const agregar = (lista, valor, limpiar) => {
    const v = valor.trim();
    if (v && !datos[lista].includes(v)) {
      setDatos((p) => ({ ...p, [lista]: [...p[lista], v] }));
    }
    limpiar('');
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
  };

  const cambiarNivel = (id, nivel) => {
    setDatos((p) => ({
      ...p,
      habilidades: p.habilidades.map((s) =>
        String(s.habilidad_id) === String(id) ? { ...s, nivel } : s
      ),
    }));
  };

  const manejarFoto = (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      setErrorFoto('Elige un archivo de imagen válido.');
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setErrorFoto('La imagen supera los 5 MB.');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const lienzo = document.createElement('canvas');
        lienzo.width = TAMANO_FOTO;
        lienzo.height = TAMANO_FOTO;
        const ctx = lienzo.getContext('2d');
        const escala = Math.max(TAMANO_FOTO / img.width, TAMANO_FOTO / img.height);
        const ancho = img.width * escala;
        const alto = img.height * escala;
        ctx.drawImage(img, (TAMANO_FOTO - ancho) / 2, (TAMANO_FOTO - alto) / 2, ancho, alto);
        setDatos((p) => ({ ...p, foto: lienzo.toDataURL('image/jpeg', 0.85) }));
        setErrorFoto('');
      };
      img.onerror = () => setErrorFoto('No pudimos leer la imagen.');
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  };

  const quitarFoto = () => {
    setDatos((p) => ({ ...p, foto: '' }));
    setErrorFoto('');
  };

  const guardar = async () => {
    if (guardando) return;
    setError('');
    setGuardado(false);
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
        foto: datos.foto,
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
      const misActualizadas = (await api.get('/mis-habilidades')).data;
      setMisHabilidades(misActualizadas || []);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar tu perfil. Inténtalo de nuevo.');
    } finally {
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

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <h2 className="proyectos-titulo mb-1">Mi perfil</h2>
        <p className="proyectos-subtitulo mb-4">
          Administra tus datos, tu foto y las habilidades que dominas.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}
        {guardado && <Alert variant="success">✓ ¡Perfil guardado correctamente!</Alert>}

        <Row className="g-4">
          <Col xl={4} xxl={3}>
            <aside className="proyectos-filtros-panel perfil-resumen">
              <div className="perfil-foto" onClick={() => inputFotoRef.current?.click()}>
                {datos.foto ? (
                  <img className="perfil-foto-img" src={datos.foto} alt="Foto de perfil" />
                ) : (
                  <span className="perfil-foto-iniciales">
                    {(almacenado?.nombre || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="perfil-foto-camara" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </span>
              </div>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={manejarFoto}
              />
              <h1 className="perfil-resumen-nombre">
                {almacenado?.nombre || ''} {almacenado?.apellido_paterno || ''}
              </h1>
              <p className="perfil-rol">{ROL_LABEL[almacenado?.rol] || almacenado?.rol || 'Usuario'}</p>

              <div className="perfil-resumen-badges">
                {datos.pais && <span className="perfil-resumen-badge">{datos.pais}</span>}
                {datos.especialidad_principal && (
                  <span className="perfil-resumen-badge">{datos.especialidad_principal}</span>
                )}
                <span className="perfil-resumen-badge">
                  {NIVEL_LABEL[datos.nivel_experiencia] || datos.nivel_experiencia}
                </span>
                <span className="perfil-resumen-badge">
                  {DISP_LABEL[datos.disponibilidad] || datos.disponibilidad}
                </span>
              </div>

              <div className="perfil-resumen-botones">
                <Button
                  variant="outline-light"
                  size="sm"
                  className="proyectos-boton w-100"
                  onClick={() => inputFotoRef.current?.click()}
                >
                  Subir foto
                </Button>
                {datos.foto && (
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="proyectos-boton recurso-borrar w-100"
                    onClick={quitarFoto}
                  >
                    Quitar foto
                  </Button>
                )}
              </div>
              {errorFoto && <p className="perfil-foto-error text-center">{errorFoto}</p>}

              <hr className="perfil-resumen-sep" />
              <Button
                type="button"
                className="login-boton w-100"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? (
                  <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </aside>
          </Col>

          <Col xl={8} xxl={9}>
            <Row className="g-4">
              <Col md={6}>
                <section className="proyecto-panel perfil-panel h-100">
                  <h2 className="perfil-card-titulo">Datos personales</h2>
                  <div className="perfil-campo">
                    <label className="login-label">Apellido materno</label>
                    <input
                      className="perfil-input"
                      placeholder="Tu apellido materno"
                      value={datos.apellido_materno}
                      onChange={set('apellido_materno')}
                    />
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
                  <div className="perfil-campo">
                    <label className="login-label">País</label>
                    <input
                      className="perfil-input"
                      placeholder="Perú, México, España..."
                      value={datos.pais}
                      onChange={set('pais')}
                    />
                  </div>
                  <div className="perfil-campo">
                    <label className="login-label">Provincia / Estado</label>
                    <input
                      className="perfil-input"
                      placeholder="Lima, CDMX, Madrid..."
                      value={datos.provincia}
                      onChange={set('provincia')}
                    />
                  </div>
                </section>
              </Col>

              <Col md={6}>
                <section className="proyecto-panel perfil-panel h-100">
                  <h2 className="perfil-card-titulo">Educación</h2>
                  <div className="perfil-campo">
                    <label className="login-label">Institución educativa</label>
                    <input
                      className="perfil-input"
                      placeholder="Universidad, instituto, bootcamp..."
                      value={datos.educacion.institucion}
                      onChange={setEducacion('institucion')}
                    />
                  </div>
                  <div className="perfil-campo">
                    <label className="login-label">Título o carrera</label>
                    <input
                      className="perfil-input"
                      placeholder="Ing. Sistemas, Bootcamp Full Stack, Autodidacta..."
                      value={datos.educacion.titulo}
                      onChange={setEducacion('titulo')}
                    />
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
                </section>
              </Col>

              <Col md={6}>
                <section className="proyecto-panel perfil-panel h-100">
                  <h2 className="perfil-card-titulo">Sobre ti</h2>
                  <div className="perfil-campo">
                    <label className="login-label">Acerca de ti</label>
                    <textarea
                      className="perfil-input perfil-textarea"
                      rows="3"
                      placeholder="Cuéntanos sobre tu experiencia, tus metas y qué buscas en NexoraLabs..."
                      value={datos.acerca_de_mi}
                      onChange={set('acerca_de_mi')}
                    />
                  </div>
                  <div className="perfil-campo">
                    <label className="login-label">Especialidad principal</label>
                    <input
                      className="perfil-input"
                      placeholder="Ej. Desarrollo Web, Machine Learning, Diseño UX/UI..."
                      value={datos.especialidad_principal}
                      onChange={set('especialidad_principal')}
                    />
                  </div>
                  <div className="perfil-campo">
                    <label className="login-label">Nivel de experiencia</label>
                    <select className="perfil-input perfil-select" value={datos.nivel_experiencia} onChange={set('nivel_experiencia')}>
                      {niveles.map((n) => (
                        <option key={n} value={n}>{NIVEL_LABEL[n] || n.charAt(0).toUpperCase() + n.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="perfil-campo">
                    <label className="login-label">Disponibilidad</label>
                    <select className="perfil-input perfil-select" value={datos.disponibilidad} onChange={set('disponibilidad')}>
                      {disponibilidades.map((d) => (
                        <option key={d} value={d}>{DISP_LABEL[d] || d.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </section>
              </Col>

              <Col md={6}>
                <section className="proyecto-panel perfil-panel h-100">
                  <h2 className="perfil-card-titulo">Colaboración</h2>
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
                  </div>
                </section>
              </Col>

              <Col xs={12}>
                <section className="proyecto-panel perfil-panel">
                  <h2 className="perfil-card-titulo">Habilidades que dominas</h2>
                  <div className="perfil-campo">
                    <label className="login-label">Buscar en el catálogo</label>
                    <input
                      className="perfil-input"
                      placeholder="Ej. React, Arduino, Ciberseguridad..."
                      value={buscarHabilidad}
                      onChange={(e) => setBuscarHabilidad(e.target.value)}
                    />
                    <p className="perfil-nota" style={{ marginTop: '0.35rem' }}>
                      Haz clic en una habilidad para agregarla a tu perfil.
                    </p>
                    {cargandoCatalogo ? (
                      <div className="perfil-cargando mt-2 text-center">
                        <Spinner animation="border" size="sm" />
                      </div>
                    ) : habilidadesCatalogo.length === 0 ? (
                      <small className="login-error-campo">El catálogo aún no tiene habilidades registradas.</small>
                    ) : (
                      <div className="perfil-catalogo">
                        {habilidadesCatalogo
                          .filter((h) => !datos.habilidades.some((s) => String(s.habilidad_id) === String(h._id)))
                          .filter((h) => h.nombre.toLowerCase().includes(buscarHabilidad.trim().toLowerCase()))
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
                  </div>

                  <div className="perfil-campo">
                    <label className="login-label">Tus habilidades declaradas</label>
                    {datos.habilidades.length === 0 ? (
                      <small className="proyectos-subtitulo">
                        Aún no has declarado habilidades. Agrega las que conoces para que te encuentren con facilidad.
                      </small>
                    ) : (
                      <div className="perfil-habilidades-lista">
                        {datos.habilidades.map((s) => {
                          const h = habilidadesCatalogo.find((x) => String(x._id) === String(s.habilidad_id));
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
                                    {NIVEL_LABEL[n] || n.charAt(0).toUpperCase() + n.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PerfilEditar;