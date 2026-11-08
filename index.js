require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const liquidacionesRoutes = require('./routes/liquidaciones');
const usuariosRoutes = require('./routes/usuarios'); // <--- 1. Importamos la ruta de usuarios

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares (con límite aumentado a 10MB para permitir los logotipos en base64)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Conexión a MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Conectado exitosamente a MongoDB Atlas'))
  .catch((err) => console.error('🔴 Error conectando a MongoDB:', err));

// Usar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/liquidaciones', liquidacionesRoutes);
app.use('/api/usuarios', usuariosRoutes); // <--- 2. Activamos la ruta /api/usuarios

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema de Liquidaciones funcionando al 100%' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});