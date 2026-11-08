const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Asegúrate que tu modelo de usuario se llame User o Usuario
const bcrypt = require('bcryptjs');

// 1. Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// 2. Crear un usuario desde el panel de admin
router.post('/crear', async (req, res) => {
  try {
    const { nombre, rut, email, password, rol } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { rut }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo o el RUT ya se encuentran registrados.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new User({
      nombre,
      rut,
      email,
      password: hashedPassword,
      rol: rol || 'user'
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el usuario', error: err.message });
  }
});

// 3. Cambiar el rol (de user a admin o viceversa)
router.put('/:id/rol', async (req, res) => {
  try {
    const { rol } = req.body; // 'admin' o 'user'
    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    ).select('-password');

    res.json({ message: 'Rol actualizado con éxito', usuario: usuarioActualizado });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el rol' });
  }
});

// 4. Restablecer contraseña a los primeros 4 dígitos del RUT
router.put('/:id/reset-password', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Extraer los primeros 4 dígitos del RUT (ej: de "12.345.678-9" limpia los números y saca 4)
    const rutLimpio = usuario.rut.replace(/[^0-9kK]/g, '');
    const passwordTemporal = rutLimpio.slice(0, 4); // Primeros 4 dígitos

    // Encriptar la contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordTemporal, salt);

    usuario.password = hashedPassword;
    usuario.debeCambiarPassword = true; // Activamos la bandera para obligar a cambiarla
    await usuario.save();

    res.json({ message: `Contraseña restablecida con éxito. Temporal: ${passwordTemporal}` });
  } catch (err) {
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: err.message });
  }
});
// 5. Eliminar un usuario por ID (Panel de Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado en la base de datos.' });
    }

    res.json({ message: '¡Usuario eliminado exitosamente!' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al eliminar el usuario', error: error.message });
  }
});

module.exports = router;