/**
 * @file RelatorioController.js
 * @description Controlador para geração de dados consolidados para relatórios.
 * @module Relatorios/RelatorioController
 */

const prisma = require('../../shared/database/prisma');

class RelatorioController {
    /**
     * Gera relatório de consumo consolidado por período e setor.
     */
    static async consumo(req, res) {
        try {
            const { dataInicio, dataFim, setor } = req.query;

            // Filtros baseados na query
            const where = {};
            if (setor) where.departamentoDestino = setor;
            if (dataInicio && dataFim) {
                // Garante que o fim do dia seja incluído (23:59:59)
                const dFim = new Date(dataFim);
                dFim.setUTCHours(23, 59, 59, 999);
                
                where.dataRegistro = {
                    gte: new Date(dataInicio),
                    lte: dFim
                };
            }

            const dados = await prisma.requisicaoConsumo.findMany({
                where,
                include: {
                    itens: true,
                    usuario: { select: { nome: true } }
                },
                orderBy: { dataRegistro: 'desc' }
            });

            // Agregações de "Inteligência"
            const totalGeral = dados.reduce((acc, r) => acc + r.valorTotal, 0);
            const totalItens = dados.reduce((acc, r) => acc + r.itens.length, 0);

            return res.status(200).json({
                filtros: { dataInicio, dataFim, setor },
                resumo: {
                    totalGeral,
                    totalItens,
                    quantidadeRequisicoes: dados.length
                },
                registros: dados
            });
        } catch (erro) {
            console.error("[RELATORIO_CONSUMO_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao gerar relatório de consumo." });
        }
    }

    /**
     * Gera relatório de ferramentas e empréstimos ativos (Excluindo TI).
     */
    static async ferramentas(req, res) {
        try {
            // Filtro para excluir itens do TI (setorId 1 ou categoria Informática)
            // IMPORTANTE: Precisamos tratar valores null explicitamente no Prisma ao usar NOT
            const whereFiltro = {
                AND: [
                    {
                        OR: [
                            { setorId: { not: 1 } },
                            { setorId: null }
                        ]
                    },
                    {
                        OR: [
                            { categoria: { not: 'Informática' } },
                            { categoria: null }
                        ]
                    }
                ]
            };

            const inventario = await prisma.ferramenta.findMany({
                where: whereFiltro,
                orderBy: { nome: 'asc' }
            });

            const emprestimosAtivos = await prisma.emprestimo.findMany({
                where: { 
                    status: 'PENDENTE',
                    ferramenta: whereFiltro
                },
                include: {
                    usuario: { select: { nome: true } },
                    ferramenta: { select: { nome: true } }
                }
            });

            return res.status(200).json({
                resumo: {
                    totalTipos: inventario.length,
                    totalFerramentas: inventario.reduce((acc, f) => acc + f.quantidadeTotal, 0),
                    totalEmprestadas: emprestimosAtivos.length
                },
                inventario,
                emprestimosAtivos
            });
        } catch (erro) {
            console.error("[RELATORIO_FERRAMENTAS_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao gerar relatório de ferramentas." });
        }
    }

    /**
     * Gera relatório exclusivo para o setor de TI.
     */
    static async ti(req, res) {
        try {
            // Filtro para incluir APENAS itens do TI
            const whereFiltro = {
                OR: [
                    { setorId: 1 },
                    { categoria: 'Informática' }
                ]
            };

            const inventario = await prisma.ferramenta.findMany({
                where: whereFiltro,
                orderBy: { nome: 'asc' }
            });

            const emprestimosAtivos = await prisma.emprestimo.findMany({
                where: { 
                    status: 'PENDENTE',
                    ferramenta: whereFiltro
                },
                include: {
                    usuario: { select: { nome: true } },
                    ferramenta: { select: { nome: true } }
                }
            });

            return res.status(200).json({
                resumo: {
                    totalTipos: inventario.length,
                    totalFerramentas: inventario.reduce((acc, f) => acc + f.quantidadeTotal, 0),
                    totalEmprestadas: emprestimosAtivos.length
                },
                inventario,
                emprestimosAtivos
            });
        } catch (erro) {
            console.error("[RELATORIO_TI_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao gerar relatório do TI." });
        }
    }
    /**
     * Gera relatório completo de Bens Permanentes (patrimônio físico).
     */
    static async bensPermanentes(req, res) {
        try {
            const { setorId, status, dataInicio, dataFim } = req.query;

            const where = {};
            if (setorId)  where.setorId  = parseInt(setorId);
            if (status)   where.status   = status;
            if (dataInicio && dataFim) {
                const dFim = new Date(dataFim);
                dFim.setUTCHours(23, 59, 59, 999);
                where.dataEntrada = { gte: new Date(dataInicio), lte: dFim };
            }

            const bens = await prisma.bemPermanente.findMany({
                where,
                include: {
                    setor: { select: { id: true, nome: true } },
                    usuarioRegistro: { select: { nome: true } }
                },
                orderBy: { dataEntrada: 'desc' }
            });

            const totalBens     = bens.length;
            const totalAdquiridos = bens.filter(b => b.origem === 'ADQUIRIDO').length;
            const totalDoacoes    = bens.filter(b => b.origem === 'DOACAO').length;
            const valorTotal      = bens.reduce((acc, b) => acc + (b.valorBem || 0), 0);
            const totalAtivos     = bens.filter(b => b.status === 'ATIVO').length;

            return res.status(200).json({
                resumo: { totalBens, totalAdquiridos, totalDoacoes, valorTotal, totalAtivos },
                registros: bens
            });
        } catch (erro) {
            console.error("[RELATORIO_BENS_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao gerar relatório de bens permanentes." });
        }
    }
}

module.exports = RelatorioController;
