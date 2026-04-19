const express = require('express');
const cors = require('cors');

// 1. IMPORTAÇÃO DOS MÓDULOS (Aqui o sistema cresce)
const rotasAlmoxarifado = require('./modulos/almoxarifado/rotas');
// const rotasRH = require('./modulos/rh/rotas'); // Exemplo de uso futuro

const app = express();

// 2. CONFIGURAÇÕES GERAIS
// O CORS permite que a tela (Frontend, seja no PC ou no celular local) consiga conversar com este Backend
app.use(cors());
// Informa ao servidor que ele vai receber e enviar dados no formato JSON (padrão moderno da web)
app.use(express.json());

// 3. REGISTRO DE ROTAS (Organização por setor)
// Toda requisição que começar com '/api/almoxarifado' será direcionada para o arquivo de rotas do almoxarifado
app.use('/api/almoxarifado', rotasAlmoxarifado);

// Exemplo futuro para outro setor:
// app.use('/api/rh', rotasRH); 


// 4. LIGANDO O SERVIDOR
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`=========================================`);
    console.log(`🚀 Sistema Gestão Integrada Inicializado`);
    console.log(`📡 Servidor rodando na porta ${PORTA}`);
    console.log(`=========================================`);
});