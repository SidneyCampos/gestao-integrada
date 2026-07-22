const express = require('express');
const router = express.Router();
const userController = require('./userController');
const sectorController = require('./sectorController');
const authMiddleware = require('../../shared/middlewares/authMiddleware');
const adminMiddleware = require('../../shared/middlewares/adminMiddleware');

/**
 * @module Users/Routes
 * @description Rotas para gestão de usuários e setores.
 * Compatível com o prefixo /api/core
 */

router.get('/usuarios', authMiddleware, userController.listar);
router.post('/usuarios', authMiddleware, adminMiddleware, userController.criar);
router.put('/usuarios/:id', authMiddleware, adminMiddleware, userController.atualizar);
router.delete('/usuarios/:id', authMiddleware, adminMiddleware, userController.deletar);
router.patch('/usuarios/:id/senha', authMiddleware, userController.alterarSenha);

// Rotas de setores — listar e criar abertas a autenticados; editar e deletar requerem admin
router.get('/setores', authMiddleware, sectorController.listar);
router.post('/setores', authMiddleware, sectorController.criar);
router.put('/setores/:id', authMiddleware, adminMiddleware, sectorController.atualizar);
router.delete('/setores/:id', authMiddleware, adminMiddleware, sectorController.deletar);


module.exports = router;
