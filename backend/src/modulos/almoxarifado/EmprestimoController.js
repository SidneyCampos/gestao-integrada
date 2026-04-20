const prisma = require('../../core/prisma');

class EmprestimoController {

    // ========================================================
    // MÉTODO: LISTAR EMPRÉSTIMOS (ATIVOS E HISTÓRICO)
    // ========================================================
    static async listar(req, res) {
        try {
            // Busca os empréstimos e já traz junto os dados de quem pegou e o que pegou!
            const emprestimos = await prisma.emprestimo.findMany({
                include: {
                    usuario: true,     // Traz os dados do funcionário
                    ferramenta: true   // Traz os dados da ferramenta
                },
                orderBy: { dataSaida: 'desc' } // Os mais recentes primeiro
            });
            return res.status(200).json(emprestimos);
        } catch (erro) {
            console.error("Erro ao listar empréstimos:", erro);
            return res.status(500).json({ erro: "Erro ao buscar histórico." });
        }
    }

    // ========================================================
    // MÉTODO: EMPRESTAR FERRAMENTA
    // ========================================================
    static async emprestar(req, res) {
        try {
            // Agora recebemos a quantidade também!
            const { usuarioId, ferramentaId, quantidade } = req.body;
            const qtdSolicitada = parseInt(quantidade) || 1;

            const ferramenta = await prisma.ferramenta.findUnique({ where: { id: ferramentaId } });

            if (!ferramenta) return res.status(404).json({ erro: "Ferramenta não encontrada." });

            // Defesa extra: Impede tentar pegar mais do que tem disponível
            if (ferramenta.qtdDisponivel < qtdSolicitada) {
                return res.status(400).json({ erro: `Estoque insuficiente. Disponível: ${ferramenta.qtdDisponivel}` });
            }

            const resultado = await prisma.$transaction([
                prisma.emprestimo.create({
                    data: {
                        usuarioId: parseInt(usuarioId),
                        ferramentaId: parseInt(ferramentaId),
                        quantidade: qtdSolicitada, // Salva a quantidade
                        status: "PENDENTE"
                    }
                }),
                prisma.ferramenta.update({
                    where: { id: ferramentaId },
                    data: { qtdDisponivel: ferramenta.qtdDisponivel - qtdSolicitada } // Subtrai a quantidade certa
                })
            ]);

            return res.status(201).json(resultado[0]);
        } catch (erro) {
            return res.status(500).json({ erro: "Erro ao realizar empréstimo." });
        }
    }

    // ========================================================
    // MÉTODO: DEVOLVER FERRAMENTA
    // ========================================================
    static async devolver(req, res) {
        try {
            const emprestimoId = parseInt(req.params.id);
            const emprestimo = await prisma.emprestimo.findUnique({ where: { id: emprestimoId } });

            if (!emprestimo || emprestimo.status === "DEVOLVIDO") {
                return res.status(400).json({ erro: "Empréstimo inválido ou já devolvido." });
            }

            const resultado = await prisma.$transaction([
                prisma.emprestimo.update({
                    where: { id: emprestimoId },
                    data: { status: "DEVOLVIDO", dataDevolucao: new Date() }
                }),
                prisma.ferramenta.update({
                    where: { id: emprestimo.ferramentaId },
                    // Devolve ao estoque a quantidade exata que foi pega!
                    data: { qtdDisponivel: { increment: emprestimo.quantidade } }
                })
            ]);

            return res.status(200).json(resultado[0]);
        } catch (erro) {
            return res.status(500).json({ erro: "Erro ao devolver." });
        }
    }
}

module.exports = EmprestimoController;