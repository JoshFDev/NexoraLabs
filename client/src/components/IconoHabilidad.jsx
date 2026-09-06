import { useState } from 'react';
import javascriptIcon from '../assets/skills/javascript.svg';
import typescriptIcon from '../assets/skills/typescript.svg';
import reactIcon from '../assets/skills/react.svg';
import pythonIcon from '../assets/skills/python.svg';
import djangoIcon from '../assets/skills/django.svg';
import flaskIcon from '../assets/skills/flask.svg';
import html5Icon from '../assets/skills/html5.svg';
import cssIcon from '../assets/skills/css.svg';
import sassIcon from '../assets/skills/sass.svg';
import lessIcon from '../assets/skills/less.svg';
import nodeIcon from '../assets/skills/node.js.svg';
import dockerIcon from '../assets/skills/docker.svg';
import kubernetesIcon from '../assets/skills/kubernetes.svg';
import mongodbIcon from '../assets/skills/mongodb.svg';
import mysqlIcon from '../assets/skills/mysql.svg';
import postgresqlIcon from '../assets/skills/postgresql.svg';
import arduinoIcon from '../assets/skills/arduino.svg';
import linuxIcon from '../assets/skills/linux.svg';
import ubuntuIcon from '../assets/skills/ubuntu.svg';
import debianIcon from '../assets/skills/debian.svg';
import centosIcon from '../assets/skills/centos.svg';
import gitIcon from '../assets/skills/git.svg';
import githubIcon from '../assets/skills/github.svg';
import gitlabIcon from '../assets/skills/gitlab.svg';
import figmaIcon from '../assets/skills/figma.svg';
import openjdkIcon from '../assets/skills/openjdk.svg';
import dotnetIcon from '../assets/skills/dotnet.svg';
import phpIcon from '../assets/skills/php.svg';
import laravelIcon from '../assets/skills/laravel.svg';
import flutterIcon from '../assets/skills/flutter.svg';
import swiftIcon from '../assets/skills/swift.svg';
import googlecloudIcon from '../assets/skills/googlecloud.svg';
import tensorflowIcon from '../assets/skills/tensorflow.svg';
import pytorchIcon from '../assets/skills/pytorch.svg';
import ciscoIcon from '../assets/skills/cisco.svg';
import expressIcon from '../assets/skills/express.svg';
import nextdotjsIcon from '../assets/skills/nextdotjs.svg';
import nestjsIcon from '../assets/skills/nestjs.svg';
import angularIcon from '../assets/skills/angular.svg';
import vuedotjsIcon from '../assets/skills/vuedotjs.svg';
import svelteIcon from '../assets/skills/svelte.svg';
import bootstrapIcon from '../assets/skills/bootstrap.svg';
import tailwindcssIcon from '../assets/skills/tailwindcss.svg';
import jqueryIcon from '../assets/skills/jquery.svg';
import cplusplusIcon from '../assets/skills/cplusplus.svg';
import cIcon from '../assets/skills/c.svg';
import goIcon from '../assets/skills/go.svg';
import rustIcon from '../assets/skills/rust.svg';
import rubyIcon from '../assets/skills/ruby.svg';
import graphqlIcon from '../assets/skills/graphql.svg';
import reduxIcon from '../assets/skills/redux.svg';
import viteIcon from '../assets/skills/vite.svg';
import npmIcon from '../assets/skills/npm.svg';
import postmanIcon from '../assets/skills/postman.svg';
import jenkinsIcon from '../assets/skills/jenkins.svg';
import circleciIcon from '../assets/skills/circleci.svg';
import travisciIcon from '../assets/skills/travisci.svg';
import githubactionsIcon from '../assets/skills/githubactions.svg';
import raspberrypiIcon from '../assets/skills/raspberrypi.svg';
import espressifIcon from '../assets/skills/espressif.svg';
import ubiquitiIcon from '../assets/skills/ubiquiti.svg';
import pfsenseIcon from '../assets/skills/pfsense.svg';
import redisIcon from '../assets/skills/redis.svg';
import nginxIcon from '../assets/skills/nginx.svg';
import grafanaIcon from '../assets/skills/grafana.svg';
import prometheusIcon from '../assets/skills/prometheus.svg';
import terraformIcon from '../assets/skills/terraform.svg';
import ansibleIcon from '../assets/skills/ansible.svg';
import firebaseIcon from '../assets/skills/firebase.svg';
import supabaseIcon from '../assets/skills/supabase.svg';
import vercelIcon from '../assets/skills/vercel.svg';
import netlifyIcon from '../assets/skills/netlify.svg';
import cloudflareIcon from '../assets/skills/cloudflare.svg';

const ICONOS = {
  javascript: javascriptIcon,
  typescript: typescriptIcon,
  react: reactIcon,
  python: pythonIcon,
  django: djangoIcon,
  flask: flaskIcon,
  html5: html5Icon,
  css: cssIcon,
  sass: sassIcon,
  less: lessIcon,
  'node.js': nodeIcon,
  docker: dockerIcon,
  kubernetes: kubernetesIcon,
  mongodb: mongodbIcon,
  mysql: mysqlIcon,
  postgresql: postgresqlIcon,
  arduino: arduinoIcon,
  linux: linuxIcon,
  ubuntu: ubuntuIcon,
  debian: debianIcon,
  centos: centosIcon,
  git: gitIcon,
  github: githubIcon,
  gitlab: gitlabIcon,
  figma: figmaIcon,
  openjdk: openjdkIcon,
  dotnet: dotnetIcon,
  php: phpIcon,
  laravel: laravelIcon,
  flutter: flutterIcon,
  swift: swiftIcon,
  googlecloud: googlecloudIcon,
  tensorflow: tensorflowIcon,
  pytorch: pytorchIcon,
  cisco: ciscoIcon,
  express: expressIcon,
  nextdotjs: nextdotjsIcon,
  nestjs: nestjsIcon,
  angular: angularIcon,
  vuedotjs: vuedotjsIcon,
  svelte: svelteIcon,
  bootstrap: bootstrapIcon,
  tailwindcss: tailwindcssIcon,
  jquery: jqueryIcon,
  cplusplus: cplusplusIcon,
  c: cIcon,
  go: goIcon,
  rust: rustIcon,
  ruby: rubyIcon,
  graphql: graphqlIcon,
  redux: reduxIcon,
  vite: viteIcon,
  npm: npmIcon,
  postman: postmanIcon,
  jenkins: jenkinsIcon,
  circleci: circleciIcon,
  travisci: travisciIcon,
  githubactions: githubactionsIcon,
  raspberrypi: raspberrypiIcon,
  espressif: espressifIcon,
  ubiquiti: ubiquitiIcon,
  pfsense: pfsenseIcon,
  redis: redisIcon,
  nginx: nginxIcon,
  grafana: grafanaIcon,
  prometheus: prometheusIcon,
  terraform: terraformIcon,
  ansible: ansibleIcon,
  firebase: firebaseIcon,
  supabase: supabaseIcon,
  vercel: vercelIcon,
  netlify: netlifyIcon,
  cloudflare: cloudflareIcon,
};

const MARCAS = [
  { claves: ['javascript', 'ecmascript'], slug: 'javascript', abrev: 'JS', fondo: '#f7df1e', letra: '#111' },
  { claves: ['typescript'], slug: 'typescript', abrev: 'TS', fondo: '#3178c6', letra: '#fff' },
  { claves: ['react', 'reactjs', 'reactnative'], slug: 'react', abrev: 'Re', fondo: '#61dafb', letra: '#0b2b38' },
  { claves: ['node'], slug: 'node.js', abrev: 'No', fondo: '#539e43', letra: '#fff' },
  { claves: ['python'], slug: 'python', abrev: 'Py', fondo: '#3776ab', letra: '#ffe873' },
  { claves: ['django'], slug: 'django', abrev: 'Dj', fondo: '#092e20', letra: '#fff' },
  { claves: ['flask'], slug: 'flask', abrev: 'Fl', fondo: '#1f1f1f', letra: '#fff' },
  { claves: ['html'], slug: 'html5', abrev: 'H5', fondo: '#e34f26', letra: '#fff' },
  { claves: ['css'], slug: 'css', abrev: 'CS', fondo: '#1572b6', letra: '#fff' },
  { claves: ['sass'], slug: 'sass', abrev: 'Sa', fondo: '#cc6699', letra: '#fff' },
  { claves: ['less'], slug: 'less', abrev: 'Le', fondo: '#1d365d', letra: '#fff' },
  { claves: ['docker'], slug: 'docker', abrev: 'Dc', fondo: '#2496ed', letra: '#fff' },
  { claves: ['kubernetes', 'k8s'], slug: 'kubernetes', abrev: 'K8', fondo: '#326ce5', letra: '#fff' },
  { claves: ['mongo'], slug: 'mongodb', abrev: 'M', fondo: '#13aa52', letra: '#fff' },
  { claves: ['mysql'], slug: 'mysql', abrev: 'My', fondo: '#4479a1', letra: '#fff' },
  { claves: ['postgres', 'postgresql'], slug: 'postgresql', abrev: 'Pg', fondo: '#336791', letra: '#fff' },
  { claves: ['sql'], slug: 'mysql', abrev: 'SQL', fondo: '#8b84a3', letra: '#fff' },
  { claves: ['arduino'], slug: 'arduino', abrev: 'Ar', fondo: '#00979d', letra: '#fff' },
  { claves: ['soldador', 'soldadura', 'electricista'], abrev: 'Sl', fondo: '#6b6584', letra: '#fff' },
  { claves: ['ubuntu'], slug: 'ubuntu', abrev: 'Ub', fondo: '#dd4814', letra: '#fff' },
  { claves: ['debian'], slug: 'debian', abrev: 'De', fondo: '#a80030', letra: '#fff' },
  { claves: ['centos'], slug: 'centos', abrev: 'Ce', fondo: '#262577', letra: '#fff' },
  { claves: ['linux'], slug: 'linux', abrev: 'Li', fondo: '#52525b', letra: '#fff' },
  { claves: ['windows'], abrev: 'Wi', fondo: '#0078d6', letra: '#fff' },
  { claves: ['github'], slug: 'github', abrev: 'Gh', fondo: '#181717', letra: '#fff' },
  { claves: ['gitlab'], slug: 'gitlab', abrev: 'Gl', fondo: '#fc6d26', letra: '#fff' },
  { claves: ['git'], slug: 'git', abrev: 'Gt', fondo: '#f05033', letra: '#fff' },
  { claves: ['figma'], slug: 'figma', abrev: 'Fi', fondo: '#a259ff', letra: '#fff' },
  { claves: ['java'], slug: 'openjdk', abrev: 'Ja', fondo: '#e76f00', letra: '#fff' },
  { claves: ['c#', 'csharp', '.net'], slug: 'dotnet', abrev: 'C#', fondo: '#68217a', letra: '#fff' },
  { claves: ['php'], slug: 'php', abrev: 'PHP', fondo: '#777bb4', letra: '#fff' },
  { claves: ['laravel'], slug: 'laravel', abrev: 'La', fondo: '#ff2d20', letra: '#fff' },
  { claves: ['flutter'], slug: 'flutter', abrev: 'Fl', fondo: '#02569b', letra: '#fff' },
  { claves: ['swift'], slug: 'swift', abrev: 'Sw', fondo: '#f05138', letra: '#fff' },
  { claves: ['google cloud', 'gcp'], slug: 'googlecloud', abrev: 'Gc', fondo: '#4285f4', letra: '#fff' },
  { claves: ['aws', 'azure', 'cloud'], abrev: 'Cl', fondo: '#5a5a70', letra: '#fff' },
  { claves: ['tensorflow'], slug: 'tensorflow', abrev: 'TF', fondo: '#ff6f00', letra: '#fff' },
  { claves: ['pytorch'], slug: 'pytorch', abrev: 'Pt', fondo: '#ee4c2c', letra: '#fff' },
  { claves: ['ia', 'inteligencia artificial', 'machine learning'], abrev: 'IA', fondo: '#7c3aed', letra: '#fff' },
  { claves: ['microcontrolador', 'microcontroladores', 'pic', 'avr', 'firmware'], abrev: 'MC', fondo: '#525252', letra: '#fff' },
  { claves: ['seguridad', 'cyberseguridad', 'ciberseguridad', 'pentest', 'hacking'], abrev: 'Sc', fondo: '#dc2626', letra: '#fff' },
  { claves: ['redes', 'network'], abrev: 'Rd', fondo: '#0e7490', letra: '#fff' },
  { claves: ['cisco'], slug: 'cisco', abrev: 'Ci', fondo: '#1ba0d7', letra: '#fff' },
  { claves: ['excel', 'office'], abrev: 'Of', fondo: '#107c41', letra: '#fff' },
  { claves: ['express'], slug: 'express', abrev: 'Ex', fondo: '#111', letra: '#fff' },
  { claves: ['next', 'nextjs'], slug: 'nextdotjs', abrev: 'Nx', fondo: '#111', letra: '#fff' },
  { claves: ['nest', 'nestjs'], slug: 'nestjs', abrev: 'Ns', fondo: '#e0234e', letra: '#fff' },
  { claves: ['angular'], slug: 'angular', abrev: 'Ng', fondo: '#dd0031', letra: '#fff' },
  { claves: ['vue', 'vuejs'], slug: 'vuedotjs', abrev: 'Vu', fondo: '#4fc08d', letra: '#213a34' },
  { claves: ['svelte'], slug: 'svelte', abrev: 'Sv', fondo: '#ff3e00', letra: '#fff' },
  { claves: ['bootstrap'], slug: 'bootstrap', abrev: 'Bs', fondo: '#7952b3', letra: '#fff' },
  { claves: ['tailwind'], slug: 'tailwindcss', abrev: 'Tw', fondo: '#38bdf8', letra: '#0b2b38' },
  { claves: ['jquery'], slug: 'jquery', abrev: 'Jq', fondo: '#0769ad', letra: '#fff' },
  { claves: ['c++', 'cplusplus'], slug: 'cplusplus', abrev: 'C++', fondo: '#00599c', letra: '#fff' },
  { claves: ['c'], slug: 'c', abrev: 'C', fondo: '#283593', letra: '#fff' },
  { claves: ['go', 'golang'], slug: 'go', abrev: 'Go', fondo: '#00add8', letra: '#0b2b38' },
  { claves: ['rust'], slug: 'rust', abrev: 'Rs', fondo: '#3a3a3a', letra: '#fff' },
  { claves: ['ruby'], slug: 'ruby', abrev: 'Rb', fondo: '#cc342d', letra: '#fff' },
  { claves: ['graphql'], slug: 'graphql', abrev: 'GQ', fondo: '#e10098', letra: '#fff' },
  { claves: ['redux'], slug: 'redux', abrev: 'Rx', fondo: '#764abc', letra: '#fff' },
  { claves: ['vite'], slug: 'vite', abrev: 'Vt', fondo: '#646cff', letra: '#fff' },
  { claves: ['npm'], slug: 'npm', abrev: 'Npm', fondo: '#cb3837', letra: '#fff' },
  { claves: ['postman'], slug: 'postman', abrev: 'Pm', fondo: '#ff6c37', letra: '#fff' },
  { claves: ['jenkins'], slug: 'jenkins', abrev: 'Jk', fondo: '#d24939', letra: '#fff' },
  { claves: ['circleci'], slug: 'circleci', abrev: 'Cc', fondo: '#343434', letra: '#fff' },
  { claves: ['travis'], slug: 'travisci', abrev: 'Tr', fondo: '#3eaaaf', letra: '#fff' },
  { claves: ['github actions', 'githubactions'], slug: 'githubactions', abrev: 'GA', fondo: '#2088ff', letra: '#fff' },
  { claves: ['gitlab ci', 'gitlabci', 'gitlab-ci'], slug: 'gitlab', abrev: 'GC', fondo: '#fc6d26', letra: '#fff' },
  { claves: ['raspberry', 'raspberrypi'], slug: 'raspberrypi', abrev: 'Rp', fondo: '#a22846', letra: '#fff' },
  { claves: ['esp32', 'esp8266', 'espressif', 'esp-idf'], slug: 'espressif', abrev: 'Es', fondo: '#4a4a4a', letra: '#fff' },
  { claves: ['ubiquiti', 'unifi', 'ubnt'], slug: 'ubiquiti', abrev: 'Ub', fondo: '#0559c9', letra: '#fff' },
  { claves: ['pf sense', 'pfsense'], slug: 'pfsense', abrev: 'Pf', fondo: '#212121', letra: '#fff' },
  { claves: ['redis'], slug: 'redis', abrev: 'Rd', fondo: '#dc382d', letra: '#fff' },
  { claves: ['nginx'], slug: 'nginx', abrev: 'Ng', fondo: '#009639', letra: '#fff' },
  { claves: ['grafana'], slug: 'grafana', abrev: 'Gr', fondo: '#f46800', letra: '#fff' },
  { claves: ['prometheus'], slug: 'prometheus', abrev: 'Pr', fondo: '#e6522c', letra: '#fff' },
  { claves: ['terraform'], slug: 'terraform', abrev: 'Tf', fondo: '#7b42bc', letra: '#fff' },
  { claves: ['ansible'], slug: 'ansible', abrev: 'An', fondo: '#1a1918', letra: '#fff' },
  { claves: ['firebase'], slug: 'firebase', abrev: 'Fb', fondo: '#ffca28', letra: '#213a34' },
  { claves: ['supabase'], slug: 'supabase', abrev: 'Sb', fondo: '#3ecf8e', letra: '#0b2b38' },
  { claves: ['vercel'], slug: 'vercel', abrev: 'Vc', fondo: '#111', letra: '#fff' },
  { claves: ['netlify'], slug: 'netlify', abrev: 'Nt', fondo: '#00c7b7', letra: '#0b2b38' },
  { claves: ['cloudflare'], slug: 'cloudflare', abrev: 'Cf', fondo: '#f38020', letra: '#fff' },
];

function IconoHabilidad({ nombre }) {
  const [fallo, setFallo] = useState(false);
  const n = (nombre || '').toLowerCase().trim();
  const marca = MARCAS.find((m) => m.claves.some((k) => (k.length <= 1 ? n === k : n.includes(k))));

  if (marca && !fallo && ICONOS[marca.slug]) {
    return (
      <span className="skill-ico skill-ico-marca" aria-hidden="true">
        <img className="skill-ico-img" src={ICONOS[marca.slug]} alt="" onError={() => setFallo(true)} />
      </span>
    );
  }

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