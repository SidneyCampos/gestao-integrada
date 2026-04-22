/**
 * @file FuncionarioController.js
 * @description Gerencia o cadastro de funcionários externos que não possuem acesso ao sistema,
 * mas que interagem com o almoxarifado (recebem ferramentas).
 * @module Almoxarifado/FuncionarioController
 */

const prisma = require('../../core/prisma');

class FuncionarioController {
    /**
     * Lista todos os usuários que são "Externos" (isSistema: false).
     */
    static async listar(req, res) {
        try {
            const funcionarios = await prisma.usuario.findMany({
                where: { isSistema: false },
                orderBy: { nome: 'asc' }
            });
            return res.status(200).json(funcionarios);
        } catch (erro) {
            console.error("[ALMOX_FUNC_LIST_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao buscar funcionários externos." });
        }
    }

    /**
     * Cria um novo funcionário externo (sem login/senha).
     */
    static async criar(req, res) {
        try {
            const { nome, telefone } = req.body;

            if (!nome) {
                return res.status(400).json({ erro: "O nome do funcionário é obrigatório." });
            }

            const novoFuncionario = await prisma.usuario.create({
                data: {
                    nome,
                    telefone,
                    isSistema: false, // Define que este usuário não acessa o sistema
                    isAdmin: false
                }
            });

            return res.status(201).json(novoFuncionario);
        } catch (erro) {
            console.error("[ALMOX_FUNC_CREATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao cadastrar funcionário externo." });
        }
    }

    /**
     * Remove um funcionário externo, desde que não tenha histórico de empréstimos.
     */
    static async deletar(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Defesa: Não deixa apagar se houver registros vinculados (Foreign Key)
            const countEmprestimos = await prisma.emprestimo.count({
                where: { usuarioId: id }
            });

            if (countEmprestimos > 0) {
                return res.status(400).json({ erro: "Não é possível excluir um funcionário que possui histórico de empréstimos ativos ou realizados." });
            }

            await prisma.usuario.delete({
                where: { id: id }
            });

            return res.status(200).json({ mensagem: "Funcionário removido com sucesso." });
        } catch (erro) {
            console.error("[ALMOX_FUNC_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir funcionário externo." });
        }
    }
}

module.exports = FuncionarioController;
