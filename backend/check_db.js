const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.usuario.findMany();
  console.log('Usuarios no banco:', users.map(u => ({ login: u.login, senha: u.senha, isAdmin: u.isAdmin, isSistema: u.isSistema })));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
