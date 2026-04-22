const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeadura do banco de dados...');

  // 1. Criar Setores
  const setorTI = await prisma.setor.upsert({
    where: { nome: 'TI' },
    update: {},
    create: { nome: 'TI' },
  });

  const setorManutencao = await prisma.setor.upsert({
    where: { nome: 'Manutenção' },
    update: {},
    create: { nome: 'Manutenção' },
  });

  const setorAdm = await prisma.setor.upsert({
    where: { nome: 'Administração' },
    update: {},
    create: { nome: 'Administração' },
  });

  const setorAlmoxarifado = await prisma.setor.upsert({
    where: { nome: 'Almoxarifado' },
    update: {},
    create: { nome: 'Almoxarifado' },
  });

  console.log('Setores criados/verificados.');

  // 2. Criar Usuários
  const joao = await prisma.usuario.create({
    data: {
      nome: 'João da Silva',
      telefone: '11999999999',
      login: 'joao.silva',
      senha: '123',
      isAdmin: false,
      isSistema: true,
      setores: {
        connect: [{ id: setorManutencao.id }, { id: setorAlmoxarifado.id }]
      }
    },
  });

  const maria = await prisma.usuario.create({
    data: {
      nome: 'Maria Oliveira',
      telefone: '11888888888',
      login: 'maria.adm',
      senha: '123',
      isAdmin: true,
      isSistema: true,
      setores: {
        connect: [{ id: setorAdm.id }, { id: setorTI.id }, { id: setorAlmoxarifado.id }]
      }
    },
  });

  console.log('Usuários criados.');

  // 3. Criar Ferramentas
  const furadeira = await prisma.ferramenta.create({
    data: {
      nome: 'Furadeira Bosch 500W',
      codigoPatrimonio: 'PAT-001',
      quantidadeTotal: 5,
      qtdDisponivel: 4,
    },
  });

  const multimetro = await prisma.ferramenta.create({
    data: {
      nome: 'Multímetro Digital Fluke',
      codigoPatrimonio: 'PAT-002',
      quantidadeTotal: 2,
      qtdDisponivel: 2,
    },
  });

  const jogoChaves = await prisma.ferramenta.create({
    data: {
      nome: 'Jogo de Chaves de Fenda',
      codigoPatrimonio: 'PAT-003',
      quantidadeTotal: 10,
      qtdDisponivel: 10,
    },
  });

  console.log('Ferramentas criadas.');

  // 4. Criar Empréstimos
  await prisma.emprestimo.create({
    data: {
      usuarioId: joao.id,
      ferramentaId: furadeira.id,
      quantidade: 1,
      status: 'PENDENTE',
      dataSaida: new Date(),
    },
  });

  console.log('Empréstimos criados.');

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
