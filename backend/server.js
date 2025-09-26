const express = require('express');
const cors = require('cors');
const http = require('http');
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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

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