/**
 * @file rotas.js
 * @description Definição das rotas para o módulo de Relatórios.
 * @module Relatorios/Rotas
 */

const express = require('express');
const router = express.Router();
const RelatorioController = require('./RelatorioController');
const sectorMiddleware = require('../../shared/middlewares/sectorMiddleware');

// Relatórios consolidados
router.get('/consumo', RelatorioController.consumo);
router.get('/ferramentas', RelatorioController.ferramentas);
router.get('/ti', sectorMiddleware('TI'), RelatorioController.ti);

module.exports = router;
