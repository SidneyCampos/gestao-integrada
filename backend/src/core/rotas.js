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
const SetorController = require('./SetorController');
const authMiddleware = require('./authMiddleware');
const adminMiddleware = require('./adminMiddleware');

router.get('/usuarios', authMiddleware, UsuarioController.listar);
router.post('/usuarios', authMiddleware, adminMiddleware, UsuarioController.criar);
router.delete('/usuarios/:id', authMiddleware, adminMiddleware, UsuarioController.deletar);
router.post('/login', AuthController.login);
router.patch('/usuarios/:id/senha', authMiddleware, UsuarioController.alterarSenha);

// Rota de setores (para preencher o dropdown no cadastro de usuários)
router.get('/setores', authMiddleware, adminMiddleware, SetorController.listar);

module.exports = router;