/**
 * @file server.js
 * @description Ponto de entrada (Entrypoint) principal do backend.
 * Configura o servidor Express, middlewares globais, rotas da API e o fornecimento de arquivos estáticos (Frontend).
 * @module Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path'); // Ferramenta nativa do Node para ler pastas

const rotasAlmoxarifado = require('./modulos/almoxarifado/rotas');
const rotasCore = require('./core/rotas');
const authMiddleware = require('./core/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// 1. ROTAS DE API (O Cérebro do Banco)
// ==========================================
app.use('/api/almoxarifado', authMiddleware, rotasAlmoxarifado);
app.use('/api/core', rotasCore);

// ==========================================
// 2. CONFIGURAÇÃO DE DEPLOY (Produção)
// ==========================================
// Aponta para a pasta 'dist' que o Vite acabou de criar
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Diz ao servidor para servir arquivos estáticos (imagens, CSS, JS) dessa pasta
app.use(express.static(frontendPath));

// "Catch-All": Qualquer URL que não for /api, ele devolve a tela do React.
// Isso impede erros de tela em branco quando você atualiza a página (F5).
// Catch-All moderno (Compatível com Express 5+). 
// Usar 'app.use' sem caminho específico faz ele capturar tudo que sobrou.
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==========================================
// 3. LIGANDO O SERVIDOR PARA A REDE LOCAL
// ==========================================
const PORTA = 3000;
// '0.0.0.0' é o código mágico que permite que QUALQUER aparelho no Wi-fi acesse o sistema
app.listen(PORTA, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 Sistema Gestão Integrada - MODO PRODUÇÃO`);
    console.log(`📡 Rodando na porta ${PORTA} e escutando a rede local`);
    console.log(`=========================================`);
});