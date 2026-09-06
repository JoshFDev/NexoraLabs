export function esPerfilCompleto(u) {
  if (!u) return false;
  return Boolean(
    u.apellido_materno &&
      u.pais &&
      u.provincia &&
      u.acerca_de_mi &&
      u.especialidad_principal &&
      Array.isArray(u.intereses) && u.intereses.length > 0 &&
      Array.isArray(u.idiomas) && u.idiomas.length > 0 &&
      u.educacion?.institucion &&
      u.educacion?.titulo
  );
}

export function leerUsuario() {
  return JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null');
}

export function guardarUsuario(usuario) {
  if (localStorage.getItem('token')) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  } else {
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  }
}

export const niveles = ['principiante', 'intermedio', 'avanzado', 'experto'];

export const disponibilidades = ['tiempo_completo', 'medio_tiempo', 'fines_de_semana', 'bajo_demanda'];

export const interesesSugeridos = [
  'Desarrollo Web',
  'Desarrollo Móvil',
  'Inteligencia Artificial',
  'Ciencia de Datos',
  'Ciberseguridad',
  'Diseño UX/UI',
  'IoT',
  'Robótica',
  'Videojuegos',
  'DevOps',
];

export const idiomasSugeridos = ['Español', 'Inglés', 'Francés', 'Portugués', 'Alemán', 'Italiano', 'Japonés', 'Chino'];