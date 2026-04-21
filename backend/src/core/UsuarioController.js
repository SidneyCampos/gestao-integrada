const prisma = require('./prisma');

class UsuarioController {
    static async listar(req, res) {
        try {
            const usuarios = await prisma.usuario.findMany({
                include: { setores: true },
                orderBy: { nome: 'asc' }
            });
            return res.status(200).json(usuarios);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: "Erro ao buscar usuários" });
        }
    }

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
            console.error(erro);
            return res.status(500).json({ erro: "Erro interno ao alterar a senha." });
        }
    }
}

module.exports = UsuarioController;