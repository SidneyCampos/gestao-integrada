const express = require('express');
const router = express.Router();
const UsuarioController = require('./UsuarioController');
const AuthController = require('./AuthController');

router.get('/usuarios', UsuarioController.listar);
router.post('/login', AuthController.login);
router.patch('/usuarios/:id/senha', UsuarioController.alterarSenha);

module.exports = router;