const prisma = require('../../core/prisma');

class EmprestimoController {

    // ========================================================
    // MÉTODO: EMPRESTAR FERRAMENTA
    // ========================================================
    static async emprestar(req, res) {
        try {
            // O frontend vai nos enviar o ID de quem está pegando e qual ferramenta
            const { usuarioId, ferramentaId } = req.body;

            // 1. Verificação de Segurança
            const ferramenta = await prisma.ferramenta.findUnique({ where: { id: ferramentaId } });

            if (!ferramenta) {
                return res.status(404).json({ erro: "Ferramenta não encontrada no banco de dados." });
            }
            if (ferramenta.qtdDisponivel <= 0) {
                return res.status(400).json({ erro: "Estoque indisponível. Todas as unidades já estão emprestadas." });
            }

            // 2. O conceito de TRANSAÇÃO (Transaction) - *Didática Explicada Abaixo*
            const resultado = await prisma.$transaction([
                // A) Criar o registro do empréstimo
                prisma.emprestimo.create({
                    data: {
                        usuarioId: parseInt(usuarioId),
                        ferramentaId: parseInt(ferramentaId),
                        status: "PENDENTE"
                    }
                }),
                // B) Diminuir a quantidade disponível no estoque
                prisma.ferramenta.update({
                    where: { id: ferramentaId },
                    data: { qtdDisponivel: ferramenta.qtdDisponivel - 1 }
                })
            ]);

            return res.status(201).json({
                mensagem: "Empréstimo realizado com sucesso!",
                emprestimo: resultado[0]
            });

        } catch (erro) {
            console.error("Erro ao emprestar ferramenta:", erro);
            return res.status(500).json({ erro: "Erro interno ao realizar empréstimo." });
        }
    }

    // ========================================================
    // MÉTODO: DEVOLVER FERRAMENTA
    // ========================================================
    static async devolver(req, res) {
        try {
            // Pegamos o ID do empréstimo que está sendo devolvido pela URL (ex: /emprestimos/1/devolver)
            const emprestimoId = parseInt(req.params.id);

            // Buscar o empréstimo
            const emprestimo = await prisma.emprestimo.findUnique({ where: { id: emprestimoId } });

            if (!emprestimo) {
                return res.status(404).json({ erro: "Empréstimo não encontrado." });
            }
            if (emprestimo.status === "DEVOLVIDO") {
                return res.status(400).json({ erro: "Esta ferramenta já foi devolvida." });
            }

            // TRANSAÇÃO para Devolução
            const resultado = await prisma.$transaction([
                // A) Atualizar o empréstimo para DEVOLVIDO e setar a data atual
                prisma.emprestimo.update({
                    where: { id: emprestimoId },
                    data: {
                        status: "DEVOLVIDO",
                        dataDevolucao: new Date() // Pega a data/hora exata de agora
                    }
                }),
                // B) Aumentar a quantidade disponível da ferramenta (Devolver ao estoque)
                prisma.ferramenta.update({
                    where: { id: emprestimo.ferramentaId },
                    data: { qtdDisponivel: { increment: 1 } } // O Prisma tem esse atalho inteligente 'increment'
                })
            ]);

            return res.status(200).json({
                mensagem: "Ferramenta devolvida com sucesso!",
                devolucao: resultado[0]
            });

        } catch (erro) {
            console.error("Erro ao devolver ferramenta:", erro);
            return res.status(500).json({ erro: "Erro interno ao processar devolução." });
        }
    }
}

module.exports = EmprestimoController;