/**
 * @file SetorController.js
 * @description Controlador para gerenciar os setores cadastrados no sistema.
 * @module Core/SetorController
 */

const prisma = require('../../shared/database/prisma');

class SetorController {
    /**
     * Lista todos os setores disponíveis para atribuição a usuários.
     */
    static async listar(req, res) {
        try {
            const setores = await prisma.setor.findMany({
                orderBy: { nome: 'asc' }
            });
            return res.status(200).json(setores);
        } catch (erro) {
            console.error("[SETOR_LIST_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao buscar setores." });
        }
    }

    /**
     * Cadastra um novo setor no sistema.
     * O nome é automaticamente convertido para MAIÚSCULAS para padronização.
     */
    static async criar(req, res) {
        try {
            const { nome } = req.body;
            if (!nome || !nome.trim()) return res.status(400).json({ erro: "Nome do setor é obrigatório." });

            const novoSetor = await prisma.setor.create({
                data: { nome: nome.trim().toUpperCase() }
            });
            return res.status(201).json(novoSetor);
        } catch (erro) {
            console.error("[SETOR_CREATE_ERROR]", erro);
            if (erro.code === 'P2002') {
                return res.status(400).json({ erro: "Este setor já está cadastrado." });
            }
            return res.status(500).json({ erro: "Erro ao criar setor." });
        }
    }

    /**
     * Atualiza o nome de um setor existente.
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome } = req.body;
            if (!nome || !nome.trim()) return res.status(400).json({ erro: "Nome do setor é obrigatório." });

            const setor = await prisma.setor.update({
                where: { id: parseInt(id) },
                data: { nome: nome.trim().toUpperCase() }
            });
            return res.status(200).json(setor);
        } catch (erro) {
            console.error("[SETOR_UPDATE_ERROR]", erro);
            if (erro.code === 'P2002') return res.status(400).json({ erro: "Já existe um setor com este nome." });
            if (erro.code === 'P2025') return res.status(404).json({ erro: "Setor não encontrado." });
            return res.status(500).json({ erro: "Erro ao atualizar setor." });
        }
    }

    /**
     * Remove um setor do sistema.
     * Verifica se há usuários vinculados antes de remover.
     */
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const setorId = parseInt(id);

            // Verificar vínculos que impediriam a exclusão
            const [totalUsuarios, totalBens, totalConsumos] = await Promise.all([
                prisma.setor.findUnique({
                    where: { id: setorId },
                    select: { _count: { select: { usuarios: true } } }
                }),
                prisma.bemPermanente?.count({ where: { setorId } }).catch(() => 0),
                prisma.requisicaoConsumo?.count({ where: { setorId } }).catch(() => 0),
            ]);

            if (!totalUsuarios) return res.status(404).json({ erro: "Setor não encontrado." });

            const qtdUsuarios = totalUsuarios._count.usuarios;
            if (qtdUsuarios > 0) {
                return res.status(400).json({
                    erro: `Não é possível excluir: ${qtdUsuarios} usuário(s) vinculado(s) a este setor.`
                });
            }

            await prisma.setor.delete({ where: { id: setorId } });
            return res.status(200).json({ mensagem: "Setor excluído com sucesso." });
        } catch (erro) {
            console.error("[SETOR_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir setor." });
        }
    }
}

module.exports = SetorController;
