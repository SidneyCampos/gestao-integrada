/**
 * @file sectorMiddleware.js
 * @description Middleware para proteção de rotas baseada em setores.
 * Verifica se o usuário logado possui vínculo com o setor exigido ou se é Administrador.
 * @module Core/SectorMiddleware
 */

const prisma = require('./prisma');

/**
 * Fabrica um middleware de verificação de setor.
 * @param {string} setorRequerido - O nome do setor que o usuário deve pertencer.
 */
const sectorMiddleware = (setorRequerido) => {
    return async (req, res, next) => {
        try {
            // req.usuario é preenchido pelo authMiddleware
            const usuario = req.usuario;

            if (!usuario) {
                return res.status(401).json({ erro: "Sessão inválida. Por favor, faça login novamente." });
            }

            // 1. Administradores possuem "chave mestra" para todos os setores
            if (usuario.isAdmin === true) {
                return next();
            }

            // 2. Busca no banco de dados os setores vinculados ao usuário
            // Fazemos isso aqui pois o Token JWT pode estar desatualizado (cached)
            const usuarioCompleto = await prisma.usuario.findUnique({
                where: { id: usuario.id },
                include: { setores: true }
            });

            if (!usuarioCompleto) {
                return res.status(404).json({ erro: "Usuário não encontrado no sistema." });
            }

            // 3. Verifica se algum dos setores do usuário coincide com o exigido pela rota
            const temVinculo = usuarioCompleto.setores.some(
                (s) => s.nome.toUpperCase() === setorRequerido.toUpperCase()
            );

            if (!temVinculo) {
                return res.status(403).json({ 
                    erro: `Acesso Negado. Esta funcionalidade é restrita ao setor: ${setorRequerido}` 
                });
            }

            // Tudo certo!
            next();

        } catch (erro) {
            console.error("[SECTOR_MIDDLEWARE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro interno ao validar permissões de setor." });
        }
    };
};

module.exports = sectorMiddleware;
