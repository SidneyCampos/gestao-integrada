/**
 * @file authMiddleware.js
 * @description Middleware para proteger rotas da API.
 * Verifica a validade do token JWT enviado no cabeçalho Authorization.
 * @module Core/AuthMiddleware
 */

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Pega o token do cabeçalho 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // O padrão é: "Bearer TOKEN_AQUI"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
    }

    try {
        // 2. Valida o token usando a nossa chave secreta
        const secret = process.env.JWT_SECRET || 'chave-secreta-padrao-iguatama';
        const verificado = jwt.verify(token, secret);
        
        // 3. Adiciona os dados do usuário verificado ao objeto 'req'
        // Assim, os controllers podem saber quem está logado
        req.usuario = verificado;
        
        next(); // Tudo certo! Pode prosseguir para a rota real.
    } catch (erro) {
        return res.status(403).json({ erro: "Token inválido ou expirado." });
    }
};

module.exports = authMiddleware;
