/**
 * @file rotas.js (Core)
 * @description Define as rotas principais da API (Autenticação e Usuários).
 * Mapeia as URLs (ex: `/login`, `/usuarios`) para as funções correspondentes nos Controllers.
 * @module Core/Rotas
 */

const express = require('express');
const router = express.Router();
const UsuarioController = require('./UsuarioController');
const AuthController = require('./AuthController');
const authMiddleware = require('./authMiddleware');

router.get('/usuarios', authMiddleware, UsuarioController.listar);
router.post('/login', AuthController.login);
router.patch('/usuarios/:id/senha', authMiddleware, UsuarioController.alterarSenha);

module.exports = router;