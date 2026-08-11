/**
 * @file ConsumoController.js
 * @description Controlador para o módulo de Materiais de Consumo.
 * Permite o lançamento ágil de requisições com itens de texto livre.
 * @module Almoxarifado/ConsumoController
 */

const prisma = require('../../shared/database/prisma');

class ConsumoController {
    /**
     * Salva uma nova requisição de consumo e seus itens vinculados.
     * Calcula o valor total e utiliza transação para garantir integridade.
     */
    static async salvarRequisicao(req, res) {
        try {
            let { departamentoDestino, setorId, mesReferencia, usuarioId, itens } = req.body;

            // Resolução de Setor para padronização sem quebrar o legado
            let idSetorSalvar = setorId ? parseInt(setorId) : null;
            if (setorId && (!departamentoDestino || departamentoDestino.trim() === '')) {
                const setorEncontrado = await prisma.setor.findUnique({
                    where: { id: idSetorSalvar }
                });
                if (setorEncontrado) {
                    departamentoDestino = setorEncontrado.nome;
                }
            } else if (departamentoDestino && !idSetorSalvar) {
                const setorEncontrado = await prisma.setor.findUnique({
                    where: { nome: departamentoDestino }
                });
                if (setorEncontrado) {
                    idSetorSalvar = setorEncontrado.id;
                }
            }

            if (!departamentoDestino || !mesReferencia || !usuarioId || !itens || !itens.length) {
                return res.status(400).json({ erro: "Dados incompletos para salvar a requisição." });
            }



            // Cálculo dos valores no backend para segurança
            let valorTotalGeral = 0;
            const itensProcessados = itens.map(item => {
                const qtd = parseFloat(item.quantidade) || 0;
                const vlrUnit = parseFloat(item.valorUnitario) || 0;
                const subtotal = qtd * vlrUnit;
                
                valorTotalGeral += subtotal;

                return {
                    descricaoProduto: item.descricaoProduto,
                    quantidade: qtd,
                    valorUnitario: vlrUnit,
                    subtotal: subtotal
                };
            });

            // Execução em transação (Capa + Itens)
            const resultado = await prisma.$transaction(async (tx) => {
                return await tx.requisicaoConsumo.create({
                    data: {
                        departamentoDestino,
                        setorId: idSetorSalvar,
                        mesReferencia,
                        usuarioId: parseInt(usuarioId),
                        valorTotal: valorTotalGeral,
                        itens: {
                            create: itensProcessados
                        }
                    },
                    include: { itens: true, setor: true }
                });
            });

            return res.status(201).json(resultado);
        } catch (erro) {
            console.error("[CONSUMO_SAVE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao salvar requisição de consumo." });
        }
    }

    /**
     * Lista todas as requisições ordenadas por data (mais recente primeiro).
     */
    static async listarRequisicoes(req, res) {
        try {
            const requisicoes = await prisma.requisicaoConsumo.findMany({
                include: {
                    itens: true,
                    usuario: {
                        select: { nome: true }
                    }
                },
                orderBy: {
                    dataRegistro: 'desc'
                }
            });
            return res.status(200).json(requisicoes);
        } catch (erro) {
            console.error("[CONSUMO_LIST_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao buscar histórico de consumo." });
        }
    }

    /**
     * Atualiza uma requisição existente.
     * Remove os itens antigos e recria os novos para garantir consistência.
     */
    static async atualizarRequisicao(req, res) {
        try {
            const { id } = req.params;
            const { departamentoDestino, mesReferencia, itens } = req.body;

            if (!departamentoDestino || !mesReferencia || !itens || !itens.length) {
                return res.status(400).json({ erro: "Dados incompletos para atualizar a requisição." });
            }

            let valorTotalGeral = 0;
            const itensProcessados = itens.map(item => {
                const qtd = parseFloat(item.quantidade) || 0;
                const vlrUnit = parseFloat(item.valorUnitario) || 0;
                const subtotal = qtd * vlrUnit;
                valorTotalGeral += subtotal;
                return {
                    descricaoProduto: item.descricaoProduto,
                    quantidade: qtd,
                    valorUnitario: vlrUnit,
                    subtotal: subtotal
                };
            });

            const resultado = await prisma.$transaction(async (tx) => {
                // 1. Removemos os itens antigos
                await tx.itemRequisicaoConsumo.deleteMany({
                    where: { requisicaoId: parseInt(id) }
                });

                // 2. Atualizamos a capa e criamos os novos itens
                return await tx.requisicaoConsumo.update({
                    where: { id: parseInt(id) },
                    data: {
                        departamentoDestino,
                        mesReferencia,
                        valorTotal: valorTotalGeral,
                        itens: {
                            create: itensProcessados
                        }
                    },
                    include: { itens: true }
                });
            });

            return res.status(200).json(resultado);
        } catch (erro) {
            console.error("[CONSUMO_UPDATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao atualizar requisição de consumo." });
        }
    }

    /**
     * Exclui uma requisição e seus itens (via Cascade).
     */
    static async deletarRequisicao(req, res) {
        try {
            const { id } = req.params;
            await prisma.requisicaoConsumo.delete({
                where: { id: parseInt(id) }
            });
            return res.status(200).json({ mensagem: "Requisição excluída com sucesso." });
        } catch (erro) {
            console.error("[CONSUMO_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir requisição de consumo." });
        }
    }
}

module.exports = ConsumoController;
