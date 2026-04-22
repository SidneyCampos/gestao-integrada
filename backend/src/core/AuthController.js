/**
 * @file AuthController.js
 * @description Controlador responsável pela lógica de autenticação do sistema.
 * Gerencia a validação de credenciais de usuários (Login) e garante 
 * os requisitos iniciais de segurança antes da emissão da sessão.
 * @module Core/AuthController
 */

const prisma = require('./prisma');
const jwt = require('jsonwebtoken');

class AuthController {
    /**
     * Valida as credenciais fornecidas e retorna os dados de sessão do usuário.
     * @param {Object} req - Objeto de requisição do Express. Deve conter `login` e `senha` no body.
     * @param {Object} res - Objeto de resposta do Express.
     * @returns {Object} JSON contendo os dados do usuário (exceto a senha) e status HTTP apropriado.
     */
    static async login(req, res) {
        try {
            const { login, senha } = req.body;

            // 1. Busca no banco se existe alguém com esse 'login'
            const usuario = await prisma.usuario.findUnique({
                where: { login: login },
                include: { setores: true } // Já traz os setores que ele tem acesso!
            });

            // 2. Se não achou usuário ou a senha não bateu
            if (!usuario || usuario.senha !== senha) {
                // Status 401 = Não Autorizado
                return res.status(401).json({ erro: "Usuário ou senha incorretos." });
            }

            // 3. REGRA DE SEGURANÇA SÊNIOR: Nunca devolva a senha para o Frontend!
            const { senha: senhaOculta, ...usuarioSeguro } = usuario;

            // 4. GERA O TOKEN DE ACESSO (JWT)
            // Guardamos o ID, Nome e se é Admin dentro do Token
            const secret = process.env.JWT_SECRET || 'chave-secreta-padrao-iguatama';
            const token = jwt.sign(
                { id: usuario.id, nome: usuario.nome, isAdmin: usuario.isAdmin },
                secret,
                { expiresIn: '8h' } // O token vale por 8 horas de trabalho
            );

            // Retorna o usuário validado e o TOKEN
            return res.status(200).json({
                usuario: usuarioSeguro,
                token: token
            });

        } catch (erro) {
            console.error("[AUTH_LOGIN_ERROR]", erro);
            return res.status(500).json({ erro: "Erro interno no servidor de autenticação." });
        }
    }
}

module.exports = AuthController;