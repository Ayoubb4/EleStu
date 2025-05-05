const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Registro de usuario
exports.registrarUsuario = async (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    try {
        const usuarioExistente = await Usuario.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        const contraseñaCifrada = await bcrypt.hash(contraseña, 10);
        const nuevoUsuario = new Usuario({
            nombre,
            correo,
            contraseña: contraseñaCifrada
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar usuario', detalles: err });
    }
};

// Login de usuario
exports.loginUsuario = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const esValidaContraseña = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esValidaContraseña) {
            return res.status(400).json({ error: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign({ usuarioId: usuario._id }, 'mi-secreto', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error al hacer login', detalles: err });
    }
};
