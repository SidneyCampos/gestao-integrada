import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Wrench, Users, Car, LogOut, MoreHorizontal } from "lucide-react";

const modulosDisponiveis = [
  {
    nome: "Almoxarifado",
    path: "/almoxarifado",
    icone: Wrench,
    isPrimary: true,
  },
  { nome: "Recursos Humanos", path: "/rh", icone: Users, isPrimary: false },
  { nome: "Frota de Veículos", path: "/frota", icone: Car, isPrimary: false },
];

// CORREÇÃO AQUI: Chaves { } adicionadas para extrair as variáveis do React corretamente!
export default function Layout({ usuario, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  // NOVO ESTADO: Controla se a janelinha do botão 'Mais' está aberta
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);

  const modulosPermitidos = modulosDisponiveis.filter((modulo) => {
    if (usuario?.isAdmin) return true;
    return usuario?.setores?.some((setor) => setor.nome === modulo.nome);
  });

  const modulosPrimarios = modulosPermitidos.filter((m) => m.isPrimary);
  // NOVA VARIÁVEL: Pega todos os módulos que NÃO são primários (ex: RH e Frota)
  const modulosSecundarios = modulosPermitidos.filter((m) => !m.isPrimary);

  return (
    <div className="flex h-[100dvh] bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* ================= BARRA LATERAL (DESKTOP) ================= */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shadow-xl z-20 shrink-0">
        <div className="h-20 bg-white flex items-center justify-center p-2 border-b border-slate-200">
          <img
            src="/logo-completo.png"
            alt="Prefeitura de Iguatama"
            className="h-full w-full object-contain"
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {/* USAMOS A LISTA FILTRADA AQUI */}
          {modulosPermitidos.map((modulo) => (
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
          {/* BOTÃO SAIR CORRIGIDO COM EVENTO onClick={onLogout} */}
          <button
            onClick={onLogout}
            className="flex items-center w-full p-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
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
              <div className="flex flex-col text-right mr-4">
                {/* NOME DO USUÁRIO VERDADEIRO */}
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {usuario?.nome || "Servidor"}
                </span>
                {/* SETOR DO USUÁRIO VERDADEIRO */}
                <span className="text-xs text-slate-500 leading-tight">
                  {usuario?.isAdmin
                    ? "Administrador Geral"
                    : usuario?.setores?.[0]?.nome || "Sem Setor"}
                </span>
              </div>
              {/* PRIMEIRA LETRA DO NOME NA BOLINHA */}
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {usuario?.nome?.charAt(0).toUpperCase() || "S"}
              </div>
            </div>
          </div>

          {/* Header do Mobile */}
          <div className="md:hidden h-full flex items-center justify-between px-4">
            <div className="h-12 w-48 flex items-center">
              <img
                src="/logo-completo.png"
                alt="Iguatama"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-blue-100">
              {usuario?.nome?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ================= BARRA DE NAVEGAÇÃO INFERIOR (MOBILE) ================= */}
      {/* ================= BARRA DE NAVEGAÇÃO INFERIOR (MOBILE) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] z-50">
        {/* OVERLAY: Se o menu 'Mais' estiver aberto e clicar fora, ele fecha */}
        {menuMaisAberto && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setMenuMaisAberto(false)}
          ></div>
        )}

        {/* MENU FLUTUANTE DO BOTÃO MAIS */}
        {menuMaisAberto && modulosSecundarios.length > 0 && (
          <div className="absolute bottom-20 right-4 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2">
            {modulosSecundarios.map((modulo) => (
              <Link
                key={modulo.nome}
                to={modulo.path}
                onClick={() => setMenuMaisAberto(false)} // Fecha o menu ao clicar num link
                className="flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <modulo.icone className="w-5 h-5 text-slate-500" />
                <span className="font-semibold text-sm text-slate-700">
                  {modulo.nome}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)] relative z-50">
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

          {/* BOTÃO MAIS COM AÇÃO DE CLIQUE */}
          <button
            onClick={() => setMenuMaisAberto(!menuMaisAberto)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${menuMaisAberto ? "text-blue-600" : "text-slate-500"}`}
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] font-semibold tracking-wide">
              Mais
            </span>
          </button>

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-500/80 hover:text-red-600"
          >
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
