const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/emprendedores_unidos',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};