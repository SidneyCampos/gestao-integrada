/**
 * @file UsuarioController.js
 * @description Controlador responsável pela gestão de usuários no sistema.
 * Trata as requisições de listagem de funcionários e alteração de senhas.
 * @module Core/UsuarioController
 */

const prisma = require('./prisma');

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
}

module.exports = UsuarioController;