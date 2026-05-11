/**
 * @file rotas.js (Almoxarifado)
 * @description Define as rotas específicas para o módulo de Almoxarifado.
 * Mapeia as URLs de ferramentas e empréstimos para os respectivos Controllers.
 * @module Almoxarifado/Rotas
 */

const express = require('express');
const router = express.Router();

const toolInventoryController = require('./toolInventoryController');
const inventoryLoanController = require('./inventoryLoanController');
const externalEmployeeController = require('./externalEmployeeController');
const consumableMaterialController = require('./consumableMaterialController');
const consumableProductController = require('./consumableProductController');
const sectorMiddleware = require('../../shared/middlewares/sectorMiddleware');

// --- Rotas de Ferramentas ---
router.get('/ferramentas', toolInventoryController.listar);
router.post('/ferramentas', toolInventoryController.criar);
router.delete('/ferramentas/:id', toolInventoryController.deletar);

// ROTA DE AJUSTE RÁPIDO (Protegida para TI ou Admin)
router.patch('/ferramentas/:id/ajustar-estoque', sectorMiddleware('TI'), toolInventoryController.ajustarEstoque);

// --- Rotas de Empréstimos ---

// NOVA ROTA: Buscar a lista de empréstimos
router.get('/emprestimos', inventoryLoanController.listar);

router.post('/emprestimos', inventoryLoanController.emprestar);
router.patch('/emprestimos/:id/devolver', inventoryLoanController.devolver);

// --- Rotas de Funcionários Externos ---
router.get('/funcionarios', externalEmployeeController.listar);
router.post('/funcionarios', externalEmployeeController.criar);
router.put('/funcionarios/:id', externalEmployeeController.atualizar);
router.delete('/funcionarios/:id', externalEmployeeController.deletar);

// --- Rotas de Materiais de Consumo ---
router.get('/consumo', consumableMaterialController.listarRequisicoes);
router.post('/consumo', consumableMaterialController.salvarRequisicao);
router.put('/consumo/:id', consumableMaterialController.atualizarRequisicao);
router.delete('/consumo/:id', consumableMaterialController.deletarRequisicao);

// --- Rotas do Catálogo de Produtos (Estoque) ---
router.get('/produtos-consumo', consumableProductController.listar);
router.post('/produtos-consumo', consumableProductController.criar);
router.put('/produtos-consumo/:id', consumableProductController.atualizar);
router.delete('/produtos-consumo/:id', consumableProductController.deletar);

module.exports = router;