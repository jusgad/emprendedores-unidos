const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

const { testConnection } = require('./db/connection');
const { createTables, insertDefaultCategories } = require('./db/models');
const { initializeSocket } = require('./services/socketService');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const tiendaRoutes = require('./routes/tiendas');
const pedidoRoutes = require('./routes/pedidos');
const socialRoutes = require('./routes/social');
const pagoRoutes = require('./routes/pagos');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Validar variables de entorno críticas
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'GENERAR_SECRET_SEGURO_MINIMO_64_CARACTERES') {
  console.error('❌ ERROR: JWT_SECRET no configurado en .env');
  process.exit(1);
}

// Seguridad HTTP headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rate limiting para autenticación más estricto
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos de login
  skipSuccessfulRequests: true,
  message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos'
});

// CORS configurado
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers con límites
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización contra NoSQL injection y XSS
app.use(mongoSanitize());

// Protección contra HTTP Parameter Pollution
app.use(hpp());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Emprendedores Unidos API - v1.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Emprendedores Unidos API - Marketplace & Red Social', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      tiendas: '/api/tiendas',
      pedidos: '/api/pedidos',
      social: '/api/social',
      pagos: '/api/pagos',
      upload: '/api/upload'
    }
  });
});

const { errorHandler, notFound } = require('./middleware/errorHandler');

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log('🚀 Iniciando Emprendedores Unidos API...');
    
    const dbConnected = await testConnection();
    if (dbConnected) {
      await createTables();
      await insertDefaultCategories();
    }
    
    initializeSocket(server);
    console.log('📡 WebSocket configurado');
    
    server.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📊 Base de datos: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Simulada'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});