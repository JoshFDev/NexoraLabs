const MARCAS = [
  { claves: ['javascript', 'ecmascript'], abrev: 'JS', fondo: '#f7df1e', letra: '#111' },
  { claves: ['node'], abrev: 'No', fondo: '#539e43', letra: '#fff' },
  { claves: ['typescript'], abrev: 'TS', fondo: '#3178c6', letra: '#fff' },
  { claves: ['react'], abrev: 'Re', fondo: '#61dafb', letra: '#0b2b38' },
  { claves: ['python', 'django', 'flask'], abrev: 'Py', fondo: '#3776ab', letra: '#ffe873' },
  { claves: ['html'], abrev: 'H5', fondo: '#e34f26', letra: '#fff' },
  { claves: ['css', 'sass', 'less'], abrev: 'CS', fondo: '#1572b6', letra: '#fff' },
  { claves: ['docker', 'kubernetes', 'podman'], abrev: 'Dc', fondo: '#2496ed', letra: '#fff' },
  { claves: ['mongo'], abrev: 'M', fondo: '#13aa52', letra: '#fff' },
  { claves: ['mysql', 'postgres', 'postgresql', 'sql'], abrev: 'SQL', fondo: '#4479a1', letra: '#fff' },
  { claves: ['arduino'], abrev: 'Ar', fondo: '#00979d', letra: '#fff' },
  { claves: ['soldador', 'soldadura', 'electricista', 'soldador'], abrev: 'Sl', fondo: '#6b6584', letra: '#fff' },
  { claves: ['linux', 'ubuntu', 'debian', 'centos'], abrev: 'Li', fondo: '#52525b', letra: '#fff' },
  { claves: ['windows'], abrev: 'Wi', fondo: '#0078d6', letra: '#fff' },
  { claves: ['git', 'github', 'gitlab'], abrev: 'Gt', fondo: '#f05033', letra: '#fff' },
  { claves: ['figma'], abrev: 'Fi', fondo: '#a259ff', letra: '#fff' },
  { claves: ['java'], abrev: 'Ja', fondo: '#e76f00', letra: '#fff' },
  { claves: ['c#', 'csharp', '.net'], abrev: 'C#', fondo: '#68217a', letra: '#fff' },
  { claves: ['php', 'laravel'], abrev: 'PHP', fondo: '#777bb4', letra: '#fff' },
  { claves: ['flutter'], abrev: 'Fl', fondo: '#02569b', letra: '#fff' },
  { claves: ['swift'], abrev: 'Sw', fondo: '#f05138', letra: '#fff' },
  { claves: ['google cloud', 'gcp', 'aws', 'azure', 'cloud'], abrev: 'Cl', fondo: '#5a5a70', letra: '#fff' },
  { claves: ['ia', 'inteligencia artificial', 'machine learning', 'tensorflow', 'pytorch'], abrev: 'IA', fondo: '#7c3aed', letra: '#fff' },
  { claves: ['microcontrolador', 'microcontroladores', 'esp32', 'esp8266', 'pic', 'avr', 'firmware'], abrev: 'MC', fondo: '#525252', letra: '#fff' },
  { claves: ['seguridad', 'cyberseguridad', 'ciberseguridad', 'pentest', 'hacking'], abrev: 'Sc', fondo: '#dc2626', letra: '#fff' },
  { claves: ['redes', 'network', 'cisco'], abrev: 'Rd', fondo: '#0e7490', letra: '#fff' },
  { claves: ['excel', 'office'], abrev: 'Of', fondo: '#107c41', letra: '#fff' },
];

function IconoHabilidad({ nombre }) {
  const n = (nombre || '').toLowerCase().trim();
  const marca = MARCAS.find((m) => m.claves.some((clave) => n.includes(clave)));

  if (marca) {
    return (
      <span className="skill-ico" style={{ background: marca.fondo, color: marca.letra }} aria-hidden="true">
        {marca.abrev}
      </span>
    );
  }

  return (
    <span className="skill-ico skill-ico-def" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L3 18l3 3 5.6-5.6a4.5 4.5 0 0 0 6.1-6.1l-2.9 2.9-2.1-2.1z" />
      </svg>
    </span>
  );
}

export default IconoHabilidad;