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

  const setorPC = await prisma.setor.upsert({
    where: { nome: 'POLICIA CIVIL' },
    update: {},
    create: { nome: 'POLICIA CIVIL' },
  });

  const setorPM = await prisma.setor.upsert({
    where: { nome: 'POLICIA MILITAR' },
    update: {},
    create: { nome: 'POLICIA MILITAR' },
  });

  console.log('Setores criados/verificados.');

  // 2. Criar Usuários
  
  // Usuário Admin
  await prisma.usuario.upsert({
    where: { login: 'admin' },
    update: { isSistema: true },
    create: {
      nome: 'Administrador Geral',
      login: 'admin',
      senha: 'admin',
      isAdmin: true,
      isSistema: true,
    },
  });

  // Usuário TI
  await prisma.usuario.upsert({
    where: { login: 'ti' },
    update: { isSistema: true },
    create: {
      nome: 'Equipe de TI',
      login: 'ti',
      senha: 'ti', 
      isAdmin: false,
      isSistema: true,
      setores: {
        connect: [{ id: setorAlmoxarifado.id }, { id: setorTI.id }]
      }
    },
  });

  // Usuário Rafael Valle
  await prisma.usuario.upsert({
    where: { login: 'rafael.valle' },
    update: { isSistema: true },
    create: {
      nome: 'Rafael Valle',
      login: 'rafael.valle',
      senha: 'mudar123',
      isAdmin: false,
      isSistema: true,
      setores: {
        connect: [{ id: setorAlmoxarifado.id }]
      }
    },
  });

  // Usuário Admilson Martins
  await prisma.usuario.upsert({
    where: { login: 'admilson.martins' },
    update: { isSistema: true },
    create: {
      nome: 'Admilson Martins',
      login: 'admilson.martins',
      senha: 'mudar123',
      isAdmin: false,
      isSistema: true,
      setores: {
        connect: [{ id: setorAlmoxarifado.id }]
      }
    },
  });

  // Novos usuários do fixSectors.js
  await prisma.usuario.upsert({
    where: { login: 'joao.silva' },
    update: { setores: { connect: { id: setorAlmoxarifado.id } } },
    create: {
      nome: 'João Silva',
      login: 'joao.silva',
      senha: 'mudar123',
      isAdmin: false,
      isSistema: true,
      setores: { connect: { id: setorAlmoxarifado.id } }
    },
  });

  await prisma.usuario.upsert({
    where: { login: 'maria.adm' },
    update: { setores: { connect: { id: setorAlmoxarifado.id } } },
    create: {
      nome: 'Maria Administradora',
      login: 'maria.adm',
      senha: 'mudar123',
      isAdmin: true,
      isSistema: true,
      setores: { connect: { id: setorAlmoxarifado.id } }
    },
  });

  console.log('Usuários criados.');

  // 3. Criar Equipamentos de TI (Almoxarifado TI)
  const equipamentosTI = [
    { nome: 'Toner TW2370/Pro Resolution', qtd: 20 },
    { nome: 'Toner TN2370/Fast Print', qtd: 8 },
    { nome: 'Tinta Azul EPSON 544', qtd: 3 },
    { nome: 'Tinta Amarelo EPSON 544', qtd: 3 },
    { nome: 'Tinta Magenta EPSON 544', qtd: 3 },
    { nome: 'Toner 285/435/436', qtd: 6 },
    { nome: 'Toner Hp258a', qtd: 4 },
    { nome: 'Toner 435A/436A/285A/278', qtd: 10 },
    { nome: 'Toner TN 3382', qtd: 8 },
    { nome: 'Toner TN 1060 Brother', qtd: 14 },
    { nome: 'Toner CE285A', qtd: 3 },
    { nome: 'Toner TN 580', qtd: 8 },
    { nome: 'Switch Painel 24 portas (seclan)', qtd: 1 },
    { nome: 'Switch 24 portas PixeltI', qtd: 1 },
    { nome: 'DVR Intelbras 8 portas', qtd: 1 },
    { nome: 'Toner Brother TN3332', qtd: 1 },
    { nome: 'Switch TP-Link 24 portas', qtd: 1 },
    { nome: 'Toner P2500NW', qtd: 2 },
    { nome: 'Mouse exbom novo', qtd: 2 },
    { nome: 'Mouse exbom antigo', qtd: 1 },
    { nome: 'Rot. wifi TP Link AC750', qtd: 2 },
    { nome: 'Rot. wifi TP Link TL-WR840N', qtd: 1 },
    { nome: 'Switch Knup 8 portas', qtd: 3 },
    { nome: 'Rot. wifi Knup RW403/G', qtd: 2 },
    { nome: 'Rot. wifi Tenda N300', qtd: 1 },
    { nome: 'HD externo WD 1TB', qtd: 2 },
    { nome: 'Teclado Genérico', qtd: 7 },
    { nome: 'Filtro de linha Genérico', qtd: 5 },
    { nome: 'Mousepad RA 203D', qtd: 7 },
    { nome: 'Bateria CR2032', qtd: 7 },
    { nome: 'Placa Mãe A320M', qtd: 1 },
    { nome: 'Conversor Genérico VGA-HDMI', qtd: 1 },
    { nome: 'Estabilizador Genérico', qtd: 2 },
  ];

  for (const item of equipamentosTI) {
    const existe = await prisma.ferramenta.findFirst({
      where: { nome: item.nome }
    });

    if (existe) {
      await prisma.ferramenta.update({
        where: { id: existe.id },
        data: {
          quantidadeTotal: item.qtd,
          qtdDisponivel: item.qtd,
        }
      });
    } else {
      await prisma.ferramenta.create({
        data: {
          nome: item.nome,
          quantidadeTotal: item.qtd,
          qtdDisponivel: item.qtd,
          categoria: 'Informática',
          setorId: setorTI.id
        }
      });
    }
  }

  console.log('Equipamentos de TI cadastrados.');
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
