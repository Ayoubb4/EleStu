const mongoose = require('mongoose');

const estudioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    descripcion: { type: String },
    // Añade más campos según lo que necesites
});

const Estudio = mongoose.model('Estudio', estudioSchema);

module.exports = Estudio;
