/**
 * @file rotas.js
 * @description Definição das rotas para o módulo de Relatórios.
 * @module Relatorios/Rotas
 */

const express = require('express');
const router = express.Router();
const systemReportController = require('./systemReportController');
const sectorMiddleware = require('../../shared/middlewares/sectorMiddleware');

// Relatórios consolidados
router.get('/consumo', systemReportController.consumo);
router.get('/ferramentas', systemReportController.ferramentas);
router.get('/ti', sectorMiddleware('TI'), systemReportController.ti);

module.exports = router;
