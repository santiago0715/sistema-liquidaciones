const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRO DE USUARIO / EMPRESA
router.post('/register', async (req, res) => {
  try {
    const { nombre, rut, email, password, rol } = req.body;

    // Verificar si el usuario ya existe por correo o RUT
    const existingUser = await User.findOne({ $or: [{ email }, { rut }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo o el RUT ya se encuentran registrados.' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
    const newUser = new User({
      nombre,
      rut,
      email,
      password: hashedPassword,
      rol: rol || 'user',
      debeCambiarPassword: false
    });

    await newUser.save();
    res.status(201).json({ message: '¡Usuario registrado exitosamente!' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al registrar usuario', error: error.message });
  }
});

// 2. INICIO DE SESIÓN (LOGIN) - Permite ingresar con Correo o RUT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' recibe el valor ingresado (puede ser correo o RUT)

    // Buscar al usuario O bien por correo O bien por RUT usando $or
    const user = await User.findOne({ 
      $or: [
        { email: email },
        { rut: email }
      ] 
    });

    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas (usuario no encontrado).' });
    }

    // Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas (contraseña incorrecta).' });
    }

    // Crear Token de acceso JWT (válido por 24 horas)
    const token = jwt.sign(
      { id: user._id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '24h' }
    );

    res.json({
      message: '¡Inicio de sesión exitoso!',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rut: user.rut,
        rol: user.rol,
        debeCambiarPassword: user.debeCambiarPassword // <--- Enviamos esta bandera al frontend
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión', error: error.message });
  }
});

// 3. CAMBIAR CONTRASEÑA OBLIGATORIA (Tras reseteo del admin)
router.put('/cambiar-password', async (req, res) => {
  try {
    const { userId, nuevaPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      debeCambiarPassword: false // Desactivamos la bandera porque ya la cambió
    });

    res.json({ message: '¡Contraseña actualizada con éxito!' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al cambiar la contraseña', error: error.message });
  }
});

// 4. ELIMINAR USUARIO POR ID (Solo para administradores)
router.delete('/users/:id', async (req, res) => {
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
// 5. OBTENER LISTA DE USUARIOS (Para el panel de administración)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluimos las contraseñas por seguridad
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
});

module.exports = router;