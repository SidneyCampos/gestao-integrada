/**
 * @file FerramentaController.js
 * @description Controlador responsável pelo inventário de ferramentas no módulo de almoxarifado.
 * Permite a criação de novos itens no sistema e a listagem de todos os itens cadastrados.
 * @module Almoxarifado/FerramentaController
 */

// Importamos nossa conexão com o banco de dados
const prisma = require('../../shared/database/prisma');

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
            const { nome, codigoPatrimonio, quantidadeTotal, categoria, setorId } = req.body;

            if (!nome || !quantidadeTotal) {
                return res.status(400).json({ erro: "Nome e Quantidade Total são obrigatórios." });
            }

            const novaFerramenta = await prisma.ferramenta.create({
                data: {
                    nome,
                    codigoPatrimonio: (codigoPatrimonio && codigoPatrimonio.trim() !== "") ? codigoPatrimonio.trim() : null,
                    quantidadeTotal: parseInt(quantidadeTotal),
                    qtdDisponivel: parseInt(quantidadeTotal),
                    categoria,
                    setorId: setorId ? parseInt(setorId) : null
                }
            });

            return res.status(201).json(novaFerramenta);
        } catch (erro) {
            console.error("Erro ao criar ferramenta:", erro);
            return res.status(500).json({ erro: "Erro interno ao cadastrar o item." });
        }
    }

    // ========================================================
    // MÉTODO: LISTAR FERRAMENTAS (COM FILTRO DE SETOR)
    // ========================================================
    static async listar(req, res) {
        try {
            const { setorId, categoria, excluirCategoria } = req.query;
            
            let filtro = {};
            
            // 1. Filtro por Setor
            if (setorId === 'null') {
                filtro.setorId = null;
            } else if (setorId && !isNaN(parseInt(setorId))) {
                filtro.setorId = parseInt(setorId);
            }

            // 2. Filtro por Categoria (Inclusão)
            if (categoria) {
                filtro.categoria = categoria;
            }

            // 3. Filtro por Categoria (Exclusão)
            if (excluirCategoria) {
                filtro.OR = [
                    { categoria: { not: excluirCategoria } },
                    { categoria: null }
                ];
            }

            const ferramentas = await prisma.ferramenta.findMany({
                where: filtro,
                include: { setor: true },
                orderBy: { nome: 'asc' }
            });

            return res.status(200).json(ferramentas);
        } catch (erro) {
            console.error("Erro ao listar ferramentas:", erro);
            return res.status(500).json({ erro: "Erro ao buscar itens no banco." });
        }
    }

    // ========================================================
    // MÉTODO: AJUSTAR ESTOQUE (ENTRADA/SAÍDA RÁPIDA)
    // ========================================================
    /**
     * Permite aumentar ou diminuir o estoque total e disponível de um item.
     * Útil para consumíveis (TI) onde não há "empréstimo", mas sim uso direto.
     */
    static async ajustarEstoque(req, res) {
        try {
            const { id } = req.params;
            const { variacao } = req.body; // Ex: +5 ou -2

            if (!variacao) {
                return res.status(400).json({ erro: "Variação de estoque não informada." });
            }

            const itemOriginal = await prisma.ferramenta.findUnique({ where: { id: parseInt(id) } });

            if (!itemOriginal) {
                return res.status(404).json({ erro: "Item não encontrado." });
            }

            const novaQuantidade = itemOriginal.quantidadeTotal + parseInt(variacao);

            if (novaQuantidade < 0) {
                return res.status(400).json({ erro: "O estoque não pode ficar negativo." });
            }

            // Atualizamos tanto o total quanto o disponível (pois assume-se que é consumível)
            const itemAtualizado = await prisma.ferramenta.update({
                where: { id: parseInt(id) },
                data: {
                    quantidadeTotal: novaQuantidade,
                    qtdDisponivel: itemOriginal.qtdDisponivel + parseInt(variacao)
                }
            });

            return res.status(200).json(itemAtualizado);
        } catch (erro) {
            console.error("Erro ao ajustar estoque:", erro);
            return res.status(500).json({ erro: "Erro ao atualizar estoque." });
        }
    }
}

module.exports = FerramentaController;