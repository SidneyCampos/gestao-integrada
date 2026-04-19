const express = require('express');
const router = express.Router();

const FerramentaController = require('./FerramentaController');
// Importando o novo Controller
const EmprestimoController = require('./EmprestimoController');

// --- Rotas de Ferramentas ---
router.get('/ferramentas', FerramentaController.listar);
router.post('/ferramentas', FerramentaController.criar);

// --- Rotas de Empréstimos ---
// POST porque estamos criando um novo registro de empréstimo
router.post('/emprestimos', EmprestimoController.emprestar);

// PATCH (ou PUT) é usado quando queremos atualizar apenas uma parte do dado (no caso, o status e a data)
// O ':id' na URL significa que é um valor dinâmico. Ex: /emprestimos/5/devolver
router.patch('/emprestimos/:id/devolver', EmprestimoController.devolver);

module.exports = router;