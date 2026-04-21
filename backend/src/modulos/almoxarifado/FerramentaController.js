/**
 * @file FerramentaController.js
 * @description Controlador responsável pelo inventário de ferramentas no módulo de almoxarifado.
 * Permite a criação de novos itens no sistema e a listagem de todos os itens cadastrados.
 * @module Almoxarifado/FerramentaController
 */

// Importamos nossa conexão com o banco de dados
const prisma = require('../../core/prisma');

class FerramentaController {

    // ========================================================
    // MÉTODO: CRIAR FERRAMENTA
    // ========================================================
    /**
     * Cadastra uma nova ferramenta no banco de dados.
     * Define a `quantidade disponível` inicial como igual à `quantidade total` fornecida.
     * @param {Object} req - Objeto de requisição. Deve conter `nome`, `codigoPatrimonio` e `quantidadeTotal` no body.
     * @param {Object} res - Objeto de resposta retornando a ferramenta criada.
     */
    // O 'async' (assíncrono) é obrigatório, pois o Node não sabe 
    // quanto tempo o banco vai demorar para salvar os dados. 
    // Ele precisa "esperar" (await) a resposta.
    static async criar(req, res) {
        try {
            // req.body contém os dados que o usuário vai digitar na tela (Frontend)
            const { nome, codigoPatrimonio, quantidadeTotal } = req.body;

            // Validação simples: verificar se os campos obrigatórios vieram
            if (!nome || !quantidadeTotal) {
                // status 400 = Bad Request (O usuário mandou dados incompletos)
                return res.status(400).json({ erro: "Nome e Quantidade Total são obrigatórios." });
            }

            // Usamos o Prisma para salvar no PostgreSQL
            const novaFerramenta = await prisma.ferramenta.create({
                data: {
                    nome: nome,
                    codigoPatrimonio: codigoPatrimonio,
                    quantidadeTotal: quantidadeTotal,
                    // Quando uma ferramenta nova chega, a quantidade disponível é igual a total
                    qtdDisponivel: quantidadeTotal
                }
            });

            // status 201 = Created (Criado com sucesso). Retornamos os dados salvos.
            return res.status(201).json(novaFerramenta);

        } catch (erro) {
            // Se der erro (ex: código de patrimônio já cadastrado), o sistema cai aqui.
            // Isso impede que o servidor trave e feche sozinho.
            console.error("Erro ao criar ferramenta:", erro);
            // status 500 = Internal Server Error
            return res.status(500).json({ erro: "Erro interno ao cadastrar a ferramenta." });
        }
    }

    // ========================================================
    // MÉTODO: LISTAR TODAS AS FERRAMENTAS
    // ========================================================
    /**
     * Busca todas as ferramentas cadastradas, ordenando-as em ordem alfabética.
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta retornando um Array de ferramentas.
     */
    static async listar(req, res) {
        try {
            // findMany() é o comando do Prisma para dar um "SELECT * FROM Ferramenta"
            const ferramentas = await prisma.ferramenta.findMany({
                orderBy: { nome: 'asc' } // Já trazemos organizado em ordem alfabética para a UI
            });

            // status 200 = OK.
            return res.status(200).json(ferramentas);
        } catch (erro) {
            console.error("Erro ao listar ferramentas:", erro);
            return res.status(500).json({ erro: "Erro ao buscar ferramentas no banco." });
        }
    }
}

// Exportamos a classe para ligarmos ela às rotas
module.exports = FerramentaController;