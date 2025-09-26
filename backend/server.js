const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Emprendedores Unidos API - MVP' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});