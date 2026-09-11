# NexoraLabs

Plataforma para conectar estudiantes y personas en formación con proyectos reales, recursos de aprendizaje y oportunidades. Los usuarios crean o exploran proyectos, forman equipos, declaran habilidades, acumulan logros y se postulan a ofertas de empleo o prácticas.

## Stack

Backend:

- Node.js + Express
- MongoDB + Mongoose
- JSON Web Token para autenticacion
- Helmet, CORS, express-rate-limit y morgan
- Jest + Supertest para pruebas de API

Frontend:

- React 19 + Vite
- React Router DOM
- React-Bootstrap + Bootstrap 5
- Axios

## Estructura

```
NexoraLabs/
├── client/                 # Frontend (React + Vite)
│   └── src/
│       ├── pages/          # Vistas por modulo
│       ├── components/     # NavBar, Footer, IconoHabilidad
│       └── api.js          # Cliente Axios con manejo de token
├── src/                    # Backend (Express)
│   ├── controllers/        # Logica de negocio por modulo
│   ├── models/             # Modelos de Mongoose
│   ├── routes/             # Definicion de rutas y middlewares
│   ├── middleware/         # verifyToken, authorize
│   ├── shared/             # Errores, notificaciones, utilidades
│   └── tests/              # Pruebas con Jest + Supertest
├── .babelrc
├── .env.example
└── package.json
```

## Requisitos

- Node.js (probado con 22 o superior)
- MongoDB corriendo localmente (por defecto en `mongodb://localhost:27017`)
- pnpm (gestor usado en el proyecto; tambien funciona con npm)

## Configuracion

1. Copia `.env.example` a `.env` y ajusta los valores.

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/nexoralabs
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu_correo@gmail.com
# SMTP_PASS=tu_contrasena_de_aplicacion
```

Si defines `SMTP_USER` y `SMTP_PASS` se envia un correo de bienvenida al registrarse (Gmail requiere una contrasena de aplicacion de 16 caracteres, no la contrasena normal de la cuenta).

2. Para las pruebas se usa una base aparte. Puedes definirla con `MONGO_TEST_URI` en `.env` (por defecto `mongodb://localhost:27017/nexoralabs_test`). El test runner limpia esa base al terminar.

## Puesta en marcha

Instalar dependencias en la raiz y en el cliente:

```
pnpm install
cd client && pnpm install
```

Ejecutar el backend en un terminal:

```
pnpm dev
```

Ejecutar el frontend en otro terminal:

```
cd client
pnpm dev
```

- API: http://localhost:3000
- App: http://localhost:5173

El cliente llama a la API mediante la variable `VITE_API_URL` (por defecto `http://localhost:3000`).

## Datos de ejemplo

El proyecto incluye un generador de datos de demostracion (habilidades, proyectos, recursos, equipos y miembros). Requiere que exista al menos un usuario con rol `admin` en la base, ya que los proyectos se crean bajo ese usuario:

```
pnpm run seed
```

El script es idempotente: no duplica datos y al final muestra por consola el admin usado y los totales en la base. Revisa `src/tests/seedDemo.js` para los detalles de los datos creados. Para crear tu primer admin, registra un usuario desde la app y cambiale el rol a `admin` directamente en MongoDB, o haz un `INSERT` manual en la coleccion `usuarios`.

## Pruebas

La suite de API usa Jest y Supertest contra una base de prueba separada:

```
pnpm test
```

Cubre autenticacion, proteccion por token, proyectos, estadisticas, perfiles publicos, logros, recursos de aprendizaje, ofertas y equipos.

## Modulos principales

- Usuarios y perfiles: registro, login, edicion con foto (recorte al subir), perfil publico, habilidades e intereses.
- Proyectos: creacion con roles validos, exploracion con filtros, postulaciones y comentarios.
- Equipos: creacion (admin o mentor), solicitudes de ingreso, miembros y roles.
- Recursos de aprendizaje: catalogo con busqueda, filtros y calificaciones.
- Ofertas de empleo: publicacion, busqueda, modalidad y postulacion.
- Logros: desbloqueo automatico segun la actividad del usuario.
- Roles: `admin`, `mentor`, `desarrollador`, `ingeniero` y `estudiante` con permisos distintos por modulo.

## Scripts

En la raiz:

- `pnpm dev`: backend en desarrollo (nodemon + babel-node).
- `pnpm test`: ejecuta la suite de pruebas.
- `pnpm run seed`: carga datos de demostracion en la base.

En el cliente:

- `pnpm dev`: servidor de desarrollo Vite.
- `pnpm build`: compila el frontend para produccion.
- `pnpm preview`: previsualiza el build de produccion.