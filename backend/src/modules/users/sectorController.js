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
     */
    static async criar(req, res) {
        try {
            const { nome } = req.body;
            if (!nome) return res.status(400).json({ erro: "Nome do setor é obrigatório." });

            const novoSetor = await prisma.setor.create({
                data: { nome: nome.toUpperCase() }
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
}

module.exports = SetorController;
