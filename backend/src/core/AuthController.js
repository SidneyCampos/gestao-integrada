const prisma = require('./prisma');

class AuthController {
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

            // Retorna o usuário validado
            return res.status(200).json(usuarioSeguro);

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: "Erro interno no servidor de autenticação." });
        }
    }
}

module.exports = AuthController;