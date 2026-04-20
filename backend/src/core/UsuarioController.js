const prisma = require('./prisma');

class UsuarioController {
    static async listar(req, res) {
        try {
            // CORREÇÃO: Agora buscamos 'setores' no plural, pois é uma lista!
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
}

module.exports = UsuarioController;