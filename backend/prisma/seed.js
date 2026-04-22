const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeadura do banco de dados (PRODUÇÃO)...');

  // 1. Criar Setores
  const setorTI = await prisma.setor.upsert({
    where: { nome: 'TI' },
    update: {},
    create: { nome: 'TI' },
  });

  const setorAlmoxarifado = await prisma.setor.upsert({
    where: { nome: 'Almoxarifado' },
    update: {},
    create: { nome: 'Almoxarifado' },
  });

  console.log('Setores criados/verificados.');

  // 2. Criar Usuários
  
  // Usuário Admin
  await prisma.usuario.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      nome: 'Administrador Geral',
      login: 'admin',
      senha: 'admin',
      isAdmin: true,
      isSistema: false,
    },
  });

  // Usuário TI
  await prisma.usuario.upsert({
    where: { login: 'ti' },
    update: {},
    create: {
      nome: 'Equipe de TI',
      login: 'ti',
      senha: 'ti', // Coloquei a senha como 'ti' para facilitar, mas pode trocar no painel depois.
      isAdmin: false,
      isSistema: false,
      setores: {
        connect: [{ id: setorAlmoxarifado.id }, { id: setorTI.id }]
      }
    },
  });

  // Usuário Rafael Valle
  await prisma.usuario.upsert({
    where: { login: 'rafael.valle' },
    update: {},
    create: {
      nome: 'Rafael Valle',
      login: 'rafael.valle',
      senha: 'mudar123',
      isAdmin: false,
      isSistema: false,
      setores: {
        connect: [{ id: setorAlmoxarifado.id }]
      }
    },
  });

  // Usuário Admilson Martins
  await prisma.usuario.upsert({
    where: { login: 'admilson.martins' },
    update: {},
    create: {
      nome: 'Admilson Martins',
      login: 'admilson.martins',
      senha: 'mudar123',
      isAdmin: false,
      isSistema: false,
      setores: {
        connect: [{ id: setorAlmoxarifado.id }]
      }
    },
  });

  console.log('Usuários criados.');
  console.log('Semeadura concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
