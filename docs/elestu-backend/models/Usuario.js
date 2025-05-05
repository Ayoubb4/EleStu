const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    rol: { type: String, enum: ['usuario', 'anunciante'], default: 'usuario' },  // usuario o anunciante
    // Puedes agregar más campos si lo necesitas
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
