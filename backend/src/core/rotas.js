const express = require('express');
const router = express.Router();
const UsuarioController = require('./UsuarioController');
const AuthController = require('./AuthController'); // <-- Importa o Auth

// Rota de Usuários
router.get('/usuarios', UsuarioController.listar);

// ROTA DE LOGIN (POST porque enviaremos senha de forma oculta)
router.post('/login', AuthController.login);

module.exports = router;