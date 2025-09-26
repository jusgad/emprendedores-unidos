require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'emprendedores_user',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'emprendedores_unidos_db',
  port: process.env.DB_PORT || 5432,
};

const conectarDB = async () => {
  try {
    console.log('🚀 Simulando conexión a PostgreSQL...');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log('✅ Conexión simulada exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error en conexión simulada:', error);
    return false;
  }
};

const productos = [
  {
    id: 1,
    nombre: "Artesanía Andina",
    descripcion: "Hermosa artesanía hecha a mano por artesanos locales",
    precio: 45000,
    stock: 15,
    tiendaId: 1,
    categoria: "Arte"
  },
  {
    id: 2,
    nombre: "App Mobile MVP",
    descripcion: "Desarrollo de aplicación móvil personalizada",
    precio: 850000,
    stock: 5,
    tiendaId: 2,
    categoria: "Tecnología"
  },
  {
    id: 3,
    nombre: "Consultoría Digital",
    descripcion: "Estrategia de marketing digital para emprendimientos",
    precio: 120000,
    stock: 10,
    tiendaId: 3,
    categoria: "Servicios"
  },
  {
    id: 4,
    nombre: "Joyería Sostenible",
    descripcion: "Accesorios elaborados con materiales reciclados",
    precio: 75000,
    stock: 8,
    tiendaId: 4,
    categoria: "Arte"
  },
  {
    id: 5,
    nombre: "Curso Online Finanzas",
    descripcion: "Aprende a manejar las finanzas de tu emprendimiento",
    precio: 95000,
    stock: 25,
    tiendaId: 5,
    categoria: "Servicios"
  }
];

const posts = [
  {
    id: 1,
    tiendaId: 1,
    contenido: "¡Nuevo lote de artesanías disponibles! Apoyemos el talento local 🎨",
    imagenUrl: "https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Artesania",
    fecha: "2024-03-15T10:30:00Z",
    likes: 23
  },
  {
    id: 2,
    tiendaId: 2,
    contenido: "Acabamos de lanzar nuestra nueva app. ¿Quién quiere ser beta tester? 📱",
    imagenUrl: "https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=App+MVP",
    fecha: "2024-03-14T15:45:00Z",
    likes: 17
  },
  {
    id: 3,
    tiendaId: 3,
    contenido: "5 tips para hacer crecer tu negocio en redes sociales. Hilo 🧵👇",
    imagenUrl: "https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Marketing+Tips",
    fecha: "2024-03-13T09:15:00Z",
    likes: 31
  },
  {
    id: 4,
    tiendaId: 4,
    contenido: "Cada pieza de joyería cuenta una historia de sostenibilidad 🌱✨",
    imagenUrl: "https://via.placeholder.com/400x300/96CEB4/FFFFFF?text=Joyeria+Eco",
    fecha: "2024-03-12T14:20:00Z",
    likes: 19
  },
  {
    id: 5,
    tiendaId: 5,
    contenido: "El secreto del éxito financiero: planificación y constancia 💰📊",
    imagenUrl: "https://via.placeholder.com/400x300/FECA57/FFFFFF?text=Finanzas",
    fecha: "2024-03-11T11:00:00Z",
    likes: 42
  }
];

module.exports = {
  dbConfig,
  conectarDB,
  productos,
  posts
};