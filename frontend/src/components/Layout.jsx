import { Link, Outlet, useLocation } from "react-router-dom";
import { Wrench, Users, Car, LogOut, MoreHorizontal } from "lucide-react";

// NOVIDADE: Fonte da Verdade para o Menu
// No futuro, esta lista virá do Backend após o login, baseada nas permissões do usuário.
const modulosDisponiveis = [
  {
    nome: "Almoxarifado",
    path: "/almoxarifado",
    icone: Wrench,
    isPrimary: true,
  },
  { nome: "Recursos Humanos", path: "/rh", icone: Users, isPrimary: false },
  { nome: "Frota de Veículos", path: "/frota", icone: Car, isPrimary: false },
  // Adicione mais módulos aqui no futuro. Se 'isPrimary' for false, ele irá para o menu "Mais".
];

export default function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  // Filtramos os módulos para a barra inferior (mobile)
  const modulosPrimarios = modulosDisponiveis.filter((m) => m.isPrimary);

  return (
    <div className="flex h-[100dvh] bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* ================= BARRA LATERAL (DESKTOP) ================= */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shadow-xl z-20 shrink-0">
        {/* CORREÇÃO: Altura exata h-20 e mesma borda do cabeçalho para criar uma linha contínua */}
        <div className="h-20 bg-white flex items-center justify-center p-2 border-b border-slate-200">
          <img
            src="/logo-completo.png"
            alt="Prefeitura de Iguatama"
            className="h-full w-full object-contain"
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {/* ... (Seu código do modulosDisponiveis.map continua igual aqui) ... */}
          {modulosDisponiveis.map((modulo) => (
            <Link
              key={modulo.nome}
              to={modulo.path}
              className={`flex items-center p-3 rounded-lg transition-all ${isActive(modulo.path) ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}
            >
              <modulo.icone className="h-5 w-5" />
              <span className="ml-3 font-medium">{modulo.nome}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full p-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="ml-3 font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* ================= HEADER (DESKTOP E MOBILE) ================= */}
        <header className="h-20 shrink-0 bg-white border-b border-slate-200">
          {/* Header do Desktop */}
          <div className="hidden md:flex items-center justify-between px-8 h-full">
            <h2 className="text-xl font-bold text-slate-700 tracking-tight">
              Gestão Integrada
            </h2>

            <div className="flex items-center">
              {/* CORREÇÃO DO TEXTO 'Admin Geral Prefeitura'
                  Usando flex-col para forçar a quebra de linha e text-right para alinhar bonito */}
              <div className="flex flex-col text-right mr-4">
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  Admin Geral
                </span>
                <span className="text-xs text-slate-500 leading-tight">
                  Prefeitura
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
            </div>
          </div>

          {/* Header do Mobile */}
          {/* CORREÇÃO MOBILE: Fundo agora é branco para combinar com o logo retangular.
              O container da imagem agora é largo (w-48) em vez de ser um quadradinho. */}
          <div className="md:hidden h-full flex items-center justify-between px-4">
            <div className="h-12 w-48 flex items-center">
              <img
                src="/logo-completo.png"
                alt="Iguatama"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-blue-100">
              A
            </div>
          </div>
        </header>

        {/* ================= ÁREA DE CONTEÚDO ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ================= BARRA DE NAVEGAÇÃO INFERIOR (MOBILE) - AGORA ESCALÁVEL ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
          {modulosPrimarios.map((modulo) => (
            <Link
              key={modulo.nome}
              to={modulo.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(modulo.path) ? "text-blue-600" : "text-slate-500"}`}
            >
              <modulo.icone className="h-6 w-6" />
              <span className="text-[10px] font-semibold tracking-wide">
                {modulo.nome.substring(0, 6)}
              </span>
            </Link>
          ))}

          {/* O Botão "Mais" que mostrará os outros módulos */}
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500">
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] font-semibold tracking-wide">
              Mais
            </span>
          </button>

          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500">
            <LogOut className="h-6 w-6" />
            <span className="text-[10px] font-semibold tracking-wide">
              Sair
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
