import { Link } from "react-router-dom";
import { Wrench, Shield, Droplets } from "lucide-react";

export default function AlmoxarifadoDashboard() {
  // Nossa lista de Mini-Aplicativos do setor
  const miniApps = [
    {
      titulo: "Controle de Ferramentas",
      descricao: "Gestão de estoque, empréstimos e devoluções.",
      icone: Wrench,
      cor: "bg-blue-600",
      link: "/almoxarifado/ferramentas",
      disponivel: true,
    },
    {
      titulo: "Controle de EPIs",
      descricao: "Distribuição e cautela de equipamentos de proteção.",
      icone: Shield,
      cor: "bg-emerald-600",
      link: "#",
      disponivel: false, // Isso vai bloquear o botão visualmente
    },
    {
      titulo: "Materiais de Limpeza",
      descricao: "Gestão de requisições de consumo por setor interno.",
      icone: Droplets,
      cor: "bg-cyan-600",
      link: "#",
      disponivel: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Setor: Almoxarifado
        </h1>
        <p className="text-slate-500 mt-1">
          Selecione a ferramenta de gestão que deseja acessar.
        </p>
      </div>

      {/* Grid de Cartões (1 coluna no celular, 3 no computador) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {miniApps.map((app, index) => (
          <Link
            key={index}
            to={app.link}
            // Se não estiver disponível, deixa opaco e muda o cursor do mouse
            // Se estiver, adiciona um efeito de "flutuar" ao passar o mouse (hover:-translate-y-1)
            className={`relative p-6 bg-white rounded-xl border border-slate-200 transition-all duration-200 
              ${
                app.disponivel
                  ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            // Impede de clicar se não estiver disponível
            onClick={(e) => !app.disponivel && e.preventDefault()}
          >
            {/* Ícone Colorido */}
            <div
              className={`w-12 h-12 rounded-lg ${app.cor} text-white flex items-center justify-center mb-4 shadow-sm`}
            >
              <app.icone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {app.titulo}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {app.descricao}
            </p>

            {/* Etiqueta 'Em Breve' para impressionar os chefes com o que está por vir */}
            {!app.disponivel && (
              <span className="absolute top-6 right-6 text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider">
                Em breve
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
