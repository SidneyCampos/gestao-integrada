const express = require('express');
const router = express.Router();

const FerramentaController = require('./FerramentaController');
// Importando o novo Controller
const EmprestimoController = require('./EmprestimoController');

// --- Rotas de Ferramentas ---
router.get('/ferramentas', FerramentaController.listar);
router.post('/ferramentas', FerramentaController.criar);

// --- Rotas de Empréstimos ---

// NOVA ROTA: Buscar a lista de empréstimos
router.get('/emprestimos', EmprestimoController.listar);

router.post('/emprestimos', EmprestimoController.emprestar);
router.patch('/emprestimos/:id/devolver', EmprestimoController.devolver);

module.exports = router;