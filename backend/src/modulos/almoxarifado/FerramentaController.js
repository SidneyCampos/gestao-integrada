// Importamos nossa conexão com o banco de dados
const prisma = require('../../core/prisma');

class FerramentaController {

    // ========================================================
    // MÉTODO: CRIAR FERRAMENTA
    // ========================================================
    // O 'async' (assíncrono) é obrigatório, pois o Node não sabe 
    // quanto tempo o banco vai demorar para salvar os dados. 
    // Ele precisa "esperar" (await) a resposta.
    static async criar(req, res) {
        try {
            // req.body contém os dados que o usuário vai digitar na tela (Frontend)
            const { nome, codigoPatrimonio, quantidadeTotal } = req.body;

            // Validação simples: verificar se os campos obrigatórios vieram
            if (!nome || !quantidadeTotal) {
                // status 400 = Bad Request (O usuário mandou dados incompletos)
                return res.status(400).json({ erro: "Nome e Quantidade Total são obrigatórios." });
            }

            // Usamos o Prisma para salvar no PostgreSQL
            const novaFerramenta = await prisma.ferramenta.create({
                data: {
                    nome: nome,
                    codigoPatrimonio: codigoPatrimonio,
                    quantidadeTotal: quantidadeTotal,
                    // Quando uma ferramenta nova chega, a quantidade disponível é igual a total
                    qtdDisponivel: quantidadeTotal
                }
            });

            // status 201 = Created (Criado com sucesso). Retornamos os dados salvos.
            return res.status(201).json(novaFerramenta);

        } catch (erro) {
            // Se der erro (ex: código de patrimônio já cadastrado), o sistema cai aqui.
            // Isso impede que o servidor trave e feche sozinho.
            console.error("Erro ao criar ferramenta:", erro);
            // status 500 = Internal Server Error
            return res.status(500).json({ erro: "Erro interno ao cadastrar a ferramenta." });
        }
    }

    // ========================================================
    // MÉTODO: LISTAR TODAS AS FERRAMENTAS
    // ========================================================
    static async listar(req, res) {
        try {
            // findMany() é o comando do Prisma para dar um "SELECT * FROM Ferramenta"
            const ferramentas = await prisma.ferramenta.findMany({
                orderBy: { nome: 'asc' } // Já trazemos organizado em ordem alfabética para a UI
            });

            // status 200 = OK.
            return res.status(200).json(ferramentas);
        } catch (erro) {
            console.error("Erro ao listar ferramentas:", erro);
            return res.status(500).json({ erro: "Erro ao buscar ferramentas no banco." });
        }
    }
}

// Exportamos a classe para ligarmos ela às rotas
module.exports = FerramentaController;