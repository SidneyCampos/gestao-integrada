const express = require('express');
const router = express.Router();
const authController = require('./authController');

/**
 * @route POST /api/auth/login
 * @description Rota para autenticação de usuários
 */
router.post('/login', authController.login);

module.exports = router;
