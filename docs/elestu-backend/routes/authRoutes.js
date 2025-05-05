const express = require('express');
const { registrarUsuario, loginUsuario } = require('../controllers/authController');
const router = express.Router();

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

module.exports = router;
