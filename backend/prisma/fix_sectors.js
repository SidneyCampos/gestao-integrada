const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Iniciando vínculo do setor Almoxarifado...');
  
  // 1. Garantir que o setor Almoxarifado existe
  const almox = await prisma.setor.upsert({
    where: { nome: 'Almoxarifado' },
    update: {},
    create: { nome: 'Almoxarifado' },
  });

  // 2. Buscar usuários que queremos vincular
  const users = await prisma.usuario.findMany({
    where: {
      OR: [
        { login: 'joao.silva' },
        { login: 'maria.adm' },
        { nome: 'Administrador' }
      ]
    }
  });

  // 3. Vincular cada usuário ao setor
  for (const user of users) {
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        setores: {
          connect: { id: almox.id }
        }
      }
    });
    console.log(`Usuário ${user.nome} vinculado ao Almoxarifado.`);
  }

  console.log('Operação concluída!');
}

run()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
