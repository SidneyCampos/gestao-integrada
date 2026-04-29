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
     * Gera relatório de ferramentas e empréstimos ativos.
     */
    static async ferramentas(req, res) {
        try {
            const inventario = await prisma.ferramenta.findMany({
                orderBy: { nome: 'asc' }
            });

            const emprestimosAtivos = await prisma.emprestimo.findMany({
                where: { status: 'PENDENTE' },
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
}

module.exports = RelatorioController;
