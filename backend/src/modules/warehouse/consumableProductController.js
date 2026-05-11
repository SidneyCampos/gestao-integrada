/**
 * @file consumableProductController.js
 * @description Controlador para gerenciar o catálogo de produtos de consumo (Estoque).
 * @module Warehouse/ConsumableProductController
 */

const prisma = require('../../shared/database/prisma');

class ConsumableProductController {
    /**
     * Lista todos os produtos, opcionalmente filtrados por categoria.
     */
    static async listar(req, res) {
        try {
            const { categoria } = req.query;
            const filtro = categoria ? { categoria } : {};

            const produtos = await prisma.produtoConsumo.findMany({
                where: filtro,
                orderBy: { nome: 'asc' }
            });
            return res.status(200).json(produtos);
        } catch (erro) {
            console.error("[PRODUTO_CONSUMO_LIST_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao listar catálogo de produtos." });
        }
    }

    /**
     * Cria um novo produto no catálogo.
     */
    static async criar(req, res) {
        try {
            const { nome, categoria, quantidadeEstoque, valorUnitarioAtual } = req.body;

            if (!nome) {
                return res.status(400).json({ erro: "Nome do produto é obrigatório." });
            }

            const produto = await prisma.produtoConsumo.create({
                data: {
                    nome,
                    categoria: categoria || "Geral",
                    quantidadeEstoque: parseFloat(quantidadeEstoque) || 0,
                    valorUnitarioAtual: parseFloat(valorUnitarioAtual) || 0
                }
            });

            return res.status(201).json(produto);
        } catch (erro) {
            console.error("[PRODUTO_CONSUMO_CREATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao criar produto no catálogo." });
        }
    }

    /**
     * Atualiza dados de um produto (ex: entrada de estoque ou ajuste de preço).
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, categoria, quantidadeEstoque, valorUnitarioAtual } = req.body;

            const produto = await prisma.produtoConsumo.update({
                where: { id: parseInt(id) },
                data: {
                    nome,
                    categoria,
                    quantidadeEstoque: parseFloat(quantidadeEstoque),
                    valorUnitarioAtual: parseFloat(valorUnitarioAtual)
                }
            });

            return res.status(200).json(produto);
        } catch (erro) {
            console.error("[PRODUTO_CONSUMO_UPDATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao atualizar produto." });
        }
    }

    /**
     * Deleta um produto do catálogo.
     */
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            await prisma.produtoConsumo.delete({
                where: { id: parseInt(id) }
            });
            return res.status(200).json({ mensagem: "Produto excluído com sucesso." });
        } catch (erro) {
            console.error("[PRODUTO_CONSUMO_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir produto. Verifique se ele já não foi utilizado em requisições." });
        }
    }
}

module.exports = ConsumableProductController;
