const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para poder recibir JSON en el body
app.use(express.json());

// Ruta de prueba
app.get('/api/usuarios', (req, res) => {
    const usuarios = [
        { id: 1, nombre: 'Juan' },
        { id: 2, nombre: 'Ana' }
    ];
    res.json(usuarios);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
