const express = require('express');
const router = express.Router();
const authenticationController = require('./authenticationController');

/**
 * @route POST /api/auth/login
 * @description Rota para autenticação de usuários
 */
router.post('/login', authenticationController.login);

module.exports = router;
