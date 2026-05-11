/**
 * @file ConsumableMaterialController.js
 * @description Controlador para o módulo de Materiais de Consumo.
 * Permite requisições e gerencia automaticamente a baixa/estorno de estoque.
 * @module Warehouse/ConsumableMaterialController
 */

const prisma = require('../../shared/database/prisma');

class ConsumableMaterialController {
    /**
     * Salva uma nova requisição de consumo e seus itens vinculados.
     * Dá baixa automática no estoque dos produtos.
     */
    static async salvarRequisicao(req, res) {
        try {
            const { departamentoDestino, mesReferencia, usuarioId, itens } = req.body;

            if (!departamentoDestino || !mesReferencia || !usuarioId || !itens || !itens.length) {
                return res.status(400).json({ erro: "Dados incompletos para salvar a requisição." });
            }

            // REGRA DE NEGÓCIO: Apenas um lançamento por setor/mês
            const registroExistente = await prisma.requisicaoConsumo.findFirst({
                where: {
                    departamentoDestino,
                    mesReferencia
                }
            });

            if (registroExistente) {
                return res.status(400).json({ 
                    erro: `Já existe um lançamento para o setor "${departamentoDestino}" no mês ${mesReferencia}. Edite o registro existente para adicionar mais materiais.` 
                });
            }

            // Validação de estoque prévia
            let valorTotalGeral = 0;
            const itensProcessados = [];

            for (const item of itens) {
                const qtd = parseFloat(item.quantidade) || 0;
                const vlrUnit = parseFloat(item.valorUnitario) || 0;
                const subtotal = qtd * vlrUnit;
                valorTotalGeral += subtotal;

                if (item.produtoId) {
                    const produto = await prisma.produtoConsumo.findUnique({ where: { id: parseInt(item.produtoId) } });
                    if (!produto) {
                        return res.status(404).json({ erro: `Produto ID ${item.produtoId} não encontrado.` });
                    }
                    if (produto.quantidadeEstoque < qtd) {
                        return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}. Requer ${qtd}, mas só há ${produto.quantidadeEstoque}.` });
                    }
                }

                itensProcessados.push({
                    produtoId: item.produtoId ? parseInt(item.produtoId) : null,
                    descricaoProduto: item.descricaoProduto || "Item Genérico",
                    quantidade: qtd,
                    valorUnitario: vlrUnit,
                    subtotal: subtotal
                });
            }

            // Execução em transação (Capa + Itens + Baixa de Estoque)
            const resultado = await prisma.$transaction(async (tx) => {
                const reqCriada = await tx.requisicaoConsumo.create({
                    data: {
                        departamentoDestino,
                        mesReferencia,
                        usuarioId: parseInt(usuarioId),
                        valorTotal: valorTotalGeral,
                        itens: {
                            create: itensProcessados
                        }
                    },
                    include: { itens: true }
                });

                for (const item of itensProcessados) {
                    if (item.produtoId) {
                        await tx.produtoConsumo.update({
                            where: { id: item.produtoId },
                            data: { quantidadeEstoque: { decrement: item.quantidade } }
                        });
                    }
                }

                return reqCriada;
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
                    itens: {
                        include: { produto: true } // Inclui dados do produto se houver
                    },
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
     * Estorna o estoque antigo e aplica a baixa do novo estoque.
     */
    static async atualizarRequisicao(req, res) {
        try {
            const { id } = req.params;
            const { departamentoDestino, mesReferencia, itens } = req.body;

            if (!departamentoDestino || !mesReferencia || !itens || !itens.length) {
                return res.status(400).json({ erro: "Dados incompletos para atualizar a requisição." });
            }

            const requisicaoAntiga = await prisma.requisicaoConsumo.findUnique({
                where: { id: parseInt(id) },
                include: { itens: true }
            });

            if (!requisicaoAntiga) return res.status(404).json({ erro: "Requisição não encontrada." });

            let valorTotalGeral = 0;
            const itensProcessados = [];
            const balancoProdutos = {}; // produtoId -> { precisa: X, devolve: Y }

            // Analisa o que vai ser devolvido
            for (const itemAntigo of requisicaoAntiga.itens) {
                if (itemAntigo.produtoId) {
                    if (!balancoProdutos[itemAntigo.produtoId]) balancoProdutos[itemAntigo.produtoId] = { precisa: 0, devolve: 0 };
                    balancoProdutos[itemAntigo.produtoId].devolve += itemAntigo.quantidade;
                }
            }

            // Analisa o que vai ser exigido e processa a nova lista
            for (const itemNovo of itens) {
                const qtd = parseFloat(itemNovo.quantidade) || 0;
                const vlrUnit = parseFloat(itemNovo.valorUnitario) || 0;
                valorTotalGeral += (qtd * vlrUnit);

                if (itemNovo.produtoId) {
                    const pid = parseInt(itemNovo.produtoId);
                    if (!balancoProdutos[pid]) balancoProdutos[pid] = { precisa: 0, devolve: 0 };
                    balancoProdutos[pid].precisa += qtd;
                }

                itensProcessados.push({
                    produtoId: itemNovo.produtoId ? parseInt(itemNovo.produtoId) : null,
                    descricaoProduto: itemNovo.descricaoProduto || "Item Genérico",
                    quantidade: qtd,
                    valorUnitario: vlrUnit,
                    subtotal: (qtd * vlrUnit)
                });
            }

            // Valida se o estoque suporta a mudança
            for (const pidStr in balancoProdutos) {
                const pid = parseInt(pidStr);
                const produto = await prisma.produtoConsumo.findUnique({ where: { id: pid } });
                if (!produto) return res.status(404).json({ erro: `Produto ID ${pid} não encontrado.` });
                
                const estoqueProjetado = produto.quantidadeEstoque + balancoProdutos[pid].devolve - balancoProdutos[pid].precisa;
                if (estoqueProjetado < 0) {
                    return res.status(400).json({ erro: `Estoque insuficiente para "${produto.nome}". Ajuste impossível.` });
                }
            }

            const resultado = await prisma.$transaction(async (tx) => {
                // 1. Estornar itens antigos
                for (const itemAntigo of requisicaoAntiga.itens) {
                    if (itemAntigo.produtoId) {
                        await tx.produtoConsumo.update({
                            where: { id: itemAntigo.produtoId },
                            data: { quantidadeEstoque: { increment: itemAntigo.quantidade } }
                        });
                    }
                }

                // 2. Deletar itens antigos
                await tx.itemRequisicaoConsumo.deleteMany({
                    where: { requisicaoId: parseInt(id) }
                });

                // 3. Atualizar capa e criar novos itens
                const reqAtualizada = await tx.requisicaoConsumo.update({
                    where: { id: parseInt(id) },
                    data: {
                        departamentoDestino,
                        mesReferencia,
                        valorTotal: valorTotalGeral,
                        itens: { create: itensProcessados }
                    },
                    include: { itens: true }
                });

                // 4. Dar baixa dos novos itens
                for (const itemNovo of itensProcessados) {
                    if (itemNovo.produtoId) {
                        await tx.produtoConsumo.update({
                            where: { id: itemNovo.produtoId },
                            data: { quantidadeEstoque: { decrement: itemNovo.quantidade } }
                        });
                    }
                }

                return reqAtualizada;
            });

            return res.status(200).json(resultado);
        } catch (erro) {
            console.error("[CONSUMO_UPDATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao atualizar requisição de consumo." });
        }
    }

    /**
     * Exclui uma requisição e seus itens, restaurando o estoque.
     */
    static async deletarRequisicao(req, res) {
        try {
            const { id } = req.params;
            
            const reqParaExcluir = await prisma.requisicaoConsumo.findUnique({
                where: { id: parseInt(id) },
                include: { itens: true }
            });

            if (!reqParaExcluir) return res.status(404).json({ erro: "Requisição não encontrada." });

            await prisma.$transaction(async (tx) => {
                // 1. Estornar o estoque
                for (const item of reqParaExcluir.itens) {
                    if (item.produtoId) {
                        await tx.produtoConsumo.update({
                            where: { id: item.produtoId },
                            data: { quantidadeEstoque: { increment: item.quantidade } }
                        });
                    }
                }

                // 2. Deletar (itens são apagados via Cascade)
                await tx.requisicaoConsumo.delete({
                    where: { id: parseInt(id) }
                });
            });

            return res.status(200).json({ mensagem: "Requisição excluída e estoque estornado com sucesso." });
        } catch (erro) {
            console.error("[CONSUMO_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir requisição de consumo." });
        }
    }
}

module.exports = ConsumableMaterialController;
