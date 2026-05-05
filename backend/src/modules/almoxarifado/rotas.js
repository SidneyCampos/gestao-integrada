/**
 * @file rotas.js (Almoxarifado)
 * @description Define as rotas específicas para o módulo de Almoxarifado.
 * Mapeia as URLs de ferramentas e empréstimos para os respectivos Controllers.
 * @module Almoxarifado/Rotas
 */

const express = require('express');
const router = express.Router();

const FerramentaController = require('./FerramentaController');
const EmprestimoController = require('./EmprestimoController');
const FuncionarioController = require('./FuncionarioController');
const ConsumoController = require('./ConsumoController');
const sectorMiddleware = require('../../shared/middlewares/sectorMiddleware');

// --- Rotas de Ferramentas ---
router.get('/ferramentas', FerramentaController.listar);
router.post('/ferramentas', FerramentaController.criar);
router.delete('/ferramentas/:id', FerramentaController.deletar);

// ROTA DE AJUSTE RÁPIDO (Protegida para TI ou Admin)
router.patch('/ferramentas/:id/ajustar-estoque', sectorMiddleware('TI'), FerramentaController.ajustarEstoque);

// --- Rotas de Empréstimos ---

// NOVA ROTA: Buscar a lista de empréstimos
router.get('/emprestimos', EmprestimoController.listar);

router.post('/emprestimos', EmprestimoController.emprestar);
router.patch('/emprestimos/:id/devolver', EmprestimoController.devolver);

// --- Rotas de Funcionários Externos ---
router.get('/funcionarios', FuncionarioController.listar);
router.post('/funcionarios', FuncionarioController.criar);
router.delete('/funcionarios/:id', FuncionarioController.deletar);

// --- Rotas de Materiais de Consumo ---
router.get('/consumo', ConsumoController.listarRequisicoes);
router.post('/consumo', ConsumoController.salvarRequisicao);
router.put('/consumo/:id', ConsumoController.atualizarRequisicao);
router.delete('/consumo/:id', ConsumoController.deletarRequisicao);

module.exports = router;