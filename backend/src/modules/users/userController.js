/**
 * @file UsuarioController.js
 * @description Controlador responsável pela gestão de usuários no sistema.
 * Trata as requisições de listagem de funcionários e alteração de senhas.
 * @module Core/UsuarioController
 */

const prisma = require('../../shared/database/prisma');

class UsuarioController {
    /**
     * Busca todos os usuários cadastrados e os setores aos quais têm acesso.
     * Retorna a lista em ordem alfabética pelo nome.
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta do Express.
     * @returns {Array} JSON com a lista de usuários e seus setores.
     */
    static async listar(req, res) {
        try {
            const usuarios = await prisma.usuario.findMany({
                where: { isSistema: true }, // Lista apenas quem tem acesso ao sistema
                include: { setores: true },
                orderBy: { nome: 'asc' }
            });
            return res.status(200).json(usuarios);
        } catch (erro) {
            console.error("[USER_LIST_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao buscar usuários" });
        }
    }

    /**
     * Cadastra um novo usuário no sistema.
     * Associa o usuário aos setores informados.
     */
    static async criar(req, res) {
        try {
            const { nome, login, senha, isAdmin, setoresIds } = req.body;

            // Validação básica
            if (!nome || !login || !senha) {
                return res.status(400).json({ erro: "Nome, Login e Senha são obrigatórios." });
            }

            const novoUsuario = await prisma.usuario.create({
                data: {
                    nome,
                    login,
                    senha,
                    isAdmin: !!isAdmin,
                    setores: {
                        connect: setoresIds ? setoresIds.map(id => ({ id: parseInt(id) })) : []
                    }
                },
                include: { setores: true }
            });

            return res.status(201).json(novoUsuario);
        } catch (erro) {
            console.error("[USER_CREATE_ERROR]", erro);
            if (erro.code === 'P2002') {
                return res.status(400).json({ erro: "Este login já está em uso." });
            }
            return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
        }
    }

    /**
     * Altera a senha de um usuário específico de forma segura.
     * Exige que a nova senha tenha um tamanho mínimo para garantir segurança básica.
     * @param {Object} req - Objeto de requisição. Espera `id` na URL (params) e `novaSenha` no corpo (body).
     * @param {Object} res - Objeto de resposta do Express.
     * @returns {Object} JSON com a mensagem de sucesso ou erro.
     */
    static async alterarSenha(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { novaSenha } = req.body;

            if (!novaSenha || novaSenha.length < 3) {
                return res.status(400).json({ erro: "A senha deve ter pelo menos 3 caracteres." });
            }

            await prisma.usuario.update({
                where: { id: id },
                data: { senha: novaSenha }
            });

            return res.status(200).json({ mensagem: "Senha alterada com sucesso!" });
        } catch (erro) {
            console.error("[AUTH_LOGIN_ERROR]", erro);
            return res.status(500).json({ erro: "Erro interno no servidor de autenticação." });
        }
    }

    /**
     * Atualiza um usuário existente, permitindo alterar nome, login, senha e setores.
     */
    static async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { nome, login, senha, isAdmin, setoresIds } = req.body;

            const updateData = {
                nome,
                login,
                isAdmin: !!isAdmin,
                setores: {
                    set: setoresIds ? setoresIds.map(sid => ({ id: parseInt(sid) })) : []
                }
            };

            // Só altera a senha se ela for fornecida (não vazia)
            if (senha && senha.trim() !== "") {
                if (senha.length < 3) {
                    return res.status(400).json({ erro: "A nova senha deve ter pelo menos 3 caracteres." });
                }
                updateData.senha = senha;
            }

            const usuarioAtualizado = await prisma.usuario.update({
                where: { id: id },
                data: updateData,
                include: { setores: true }
            });

            return res.status(200).json(usuarioAtualizado);
        } catch (erro) {
            console.error("[USER_UPDATE_ERROR]", erro);
            if (erro.code === 'P2002') {
                return res.status(400).json({ erro: "Este login já está em uso por outro usuário." });
            }
            return res.status(500).json({ erro: "Erro ao atualizar usuário." });
        }
    }

    /**
     * Remove um usuário do sistema.
     */
    static async deletar(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Não permite o admin se deletar sozinho para não travar o sistema
            if (req.usuario.id === id) {
                return res.status(400).json({ erro: "Você não pode excluir sua própria conta." });
            }

            await prisma.usuario.delete({
                where: { id: id }
            });

            return res.status(200).json({ mensagem: "Usuário removido com sucesso." });
        } catch (erro) {
            console.error("[USER_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir usuário." });
        }
    }
}

module.exports = UsuarioController;