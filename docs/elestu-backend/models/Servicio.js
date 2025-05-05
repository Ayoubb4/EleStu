const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },  // Ejemplo: Música, Producción, etc.
    anunciante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },  // Relación con el usuario
});

const Servicio = mongoose.model('Servicio', servicioSchema);

module.exports = Servicio;
