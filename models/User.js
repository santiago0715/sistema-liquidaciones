const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rut: { type: String, required: true, unique: true }, // RUT del usuario o empresa
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Contraseña encriptada con bcrypt
  rol: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' // Por defecto son usuarios, tú puedes ser el 'admin'
  },
  // NUEVOS CAMPOS PARA EL REESTABLECIMIENTO DE CONTRASEÑA
  debeCambiarPassword: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);