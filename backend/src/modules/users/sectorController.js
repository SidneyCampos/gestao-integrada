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
}

module.exports = SetorController;
