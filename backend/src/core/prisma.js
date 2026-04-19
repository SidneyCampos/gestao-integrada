// Importamos o cliente do Prisma que foi gerado no comando 'db push'
const { PrismaClient } = require('@prisma/client');

// Criamos uma única instância do banco para o sistema todo.
// Toda vez que precisarmos salvar ou buscar algo, usaremos esta variável 'prisma'.
const prisma = new PrismaClient();

// Exportamos para que outros arquivos possam usar
module.exports = prisma;