const express = require('express');
const router = express.Router();
const userManagementController = require('./userManagementController');
const sectorController = require('./sectorController');
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const adminMiddleware = require('../../shared/middlewares/adminMiddleware');

/**
 * @module Users/Routes
 * @description Rotas para gestão de usuários e setores.
 * Compatível com o prefixo /api/core
 */

router.get('/usuarios', authMiddleware, userManagementController.listar);
router.post('/usuarios', authMiddleware, adminMiddleware, userManagementController.criar);
router.put('/usuarios/:id', authMiddleware, adminMiddleware, userManagementController.atualizar);
router.delete('/usuarios/:id', authMiddleware, adminMiddleware, userManagementController.deletar);
router.patch('/usuarios/:id/senha', authMiddleware, userManagementController.alterarSenha);

// Rota de setores
router.get('/setores', authMiddleware, sectorController.listar);
router.post('/setores', authMiddleware, adminMiddleware, sectorController.criar);

module.exports = router;
