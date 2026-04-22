/**
 * @file adminMiddleware.js
 * @description Middleware para restringir acesso apenas a usuários administradores.
 * Deve ser usado em conjunto com o authMiddleware.
 * @module Core/AdminMiddleware
 */

const adminMiddleware = (req, res, next) => {
    // req.usuario é injetado pelo authMiddleware anterior
    if (req.usuario && req.usuario.isAdmin === true) {
        next(); // É admin, pode passar!
    } else {
        // 403 = Forbidden (Proibido)
        res.status(403).json({ erro: "Acesso negado. Esta operação exige privilégios de Administrador." });
    }
};

module.exports = adminMiddleware;
