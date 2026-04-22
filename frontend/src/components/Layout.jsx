/**
 * @file Layout.jsx
 * @description Estrutura visual base (Shell) da aplicação.
 * Contém o cabeçalho (Header), barra lateral de navegação (Sidebar Desktop) e barra inferior (Mobile).
 * Também gerencia o Modal de Perfil de Usuário e alteração de senhas.
 * @module Frontend/Components/Layout
 */

import { useState, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
// O GRANDE CULPADO ESTAVA AQUI: Faltava o X na lista de ícones!
import { Wrench, Users, Car, LogOut, MoreHorizontal, X, Cpu } from "lucide-react";
import axios from "axios";
import { hasPermission } from "../utils/auth";
import Modal from "./Modal";

const modulosDisponiveis = [
  {
    nome: "Almoxarifado",
    path: "/almoxarifado",
    icone: Wrench,
    isPrimary: true,
  },
  {
    nome: "TI",
    path: "/ti/informatica",
    icone: Cpu,
    isPrimary: true,
  },
  { nome: "Recursos Humanos", path: "/rh", icone: Users, isPrimary: false },
  { nome: "Frota de Veículos", path: "/frota", icone: Car, isPrimary: false },
];

/**
 * Componente principal de Layout que engloba as telas filhas.
 * Responsável por renderizar dinamicamente os menus baseados nas permissões (setores) do usuário.
 * @param {Object} props - { usuario (dados do usuário logado), onLogout (função para encerrar sessão) }
 */
export default function Layout({ usuario, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const [menuMaisAberto, setMenuMaisAberto] = useState(false);

  // ESTADOS DO PERFIL
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [statusSenha, setStatusSenha] = useState({ tipo: "", msg: "" });

  // Memoriza o cálculo da navegação para não reprocessar a cada letra digitada nos inputs/modais
  const { modulosPermitidos, modulosPrimarios, modulosSecundarios } = useMemo(() => {
    // 1. Filtra os módulos padrão por permissão de setor
    const permitidos = modulosDisponiveis.filter((modulo) =>
      hasPermission(usuario, modulo.nome)
    );

    // 2. Se for Administrador, injeta o módulo de gestão de contas
    if (usuario?.isAdmin) {
      permitidos.push({
        nome: "Usuários",
        path: "/usuarios",
        icone: Users,
        isPrimary: false,
      });
    }

    return {
      modulosPermitidos: permitidos,
      modulosPrimarios: permitidos.filter((m) => m.isPrimary),
      modulosSecundarios: permitidos.filter((m) => !m.isPrimary),
    };
  }, [usuario]);

  // FUNÇÃO DE ALTERAR SENHA
  /**
   * Envia uma requisição PATCH para a API atualizar a senha do usuário logado.
   * Valida se a nova senha coincide com a confirmação antes de enviar.
   */
  const handleMudarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      return setStatusSenha({ tipo: "erro", msg: "As senhas não coincidem." });
    }
    try {
      setStatusSenha({ tipo: "loading", msg: "Salvando..." });
      await axios.patch(`/api/core/usuarios/${usuario.id}/senha`, {
        novaSenha,
      });

      setStatusSenha({ tipo: "sucesso", msg: "Senha alterada com sucesso!" });
      setNovaSenha("");
      setConfirmarSenha("");

      setTimeout(() => {
        setModalPerfilAberto(false);
        setStatusSenha({ tipo: "", msg: "" });
      }, 2000);
    } catch (erro) {
      setStatusSenha({ tipo: "erro", msg: "Erro ao alterar senha." });
    }
  };

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
          <div className="hidden md:flex items-center justify-between px-8 h-full">
            <h2 className="text-xl font-bold text-slate-700 tracking-tight">
              Gestão Integrada
            </h2>
            <div className="flex items-center">
              <div className="flex flex-col text-right mr-4">
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {usuario?.nome || "Servidor"}
                </span>
                <span className="text-xs text-slate-500 leading-tight">
                  {usuario?.isAdmin
                    ? "Administrador Geral"
                    : usuario?.setores?.[0]?.nome || "Sem Setor"}
                </span>
              </div>
              <button
                onClick={() => setModalPerfilAberto(true)}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md hover:bg-blue-700 transition-colors outline-none"
              >
                {usuario?.nome?.charAt(0).toUpperCase() || "S"}
              </button>
            </div>
          </div>

          <div className="md:hidden h-full flex items-center justify-between px-4">
            <div className="h-12 w-48 flex items-center">
              <img
                src="/logo-completo.png"
                alt="Iguatama"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <button
              onClick={() => setModalPerfilAberto(true)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-blue-100 outline-none"
            >
              {usuario?.nome?.charAt(0).toUpperCase() || "S"}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ================= BARRA DE NAVEGAÇÃO INFERIOR (MOBILE) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] z-50">
        {menuMaisAberto && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setMenuMaisAberto(false)}
          ></div>
        )}

        {menuMaisAberto && modulosSecundarios.length > 0 && (
          <div className="absolute bottom-20 right-4 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2">
            {modulosSecundarios.map((modulo) => (
              <Link
                key={modulo.nome}
                to={modulo.path}
                onClick={() => setMenuMaisAberto(false)}
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

      {/* ================= MODAL MEU PERFIL ================= */}
      <Modal
        isOpen={modalPerfilAberto}
        onClose={() => setModalPerfilAberto(false)}
        title="Meu Perfil"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {usuario?.nome?.charAt(0).toUpperCase() || "S"}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {usuario?.nome}
              </h3>
              <p className="text-sm text-slate-500">
                Login: <span className="font-mono">{usuario?.login}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
              Permissões de Acesso
            </p>
            <div className="flex flex-wrap gap-2">
              {usuario?.isAdmin ? (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">
                  👑 Administrador Geral
                </span>
              ) : (
                usuario?.setores?.map((s) => (
                  <span
                    key={s.id}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold border border-blue-200"
                  >
                    {s.nome}
                  </span>
                )) || (
                  <span className="text-sm text-slate-500 italic">
                    Nenhum setor atribuído
                  </span>
                )
              )}
            </div>
          </div>

          <form
            onSubmit={handleMudarSenha}
            className="border-t border-slate-200 pt-4 space-y-4"
          >
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Alterar Senha de Acesso
            </p>
            <div className="flex gap-4">
              <input
                type="password"
                required
                placeholder="Nova"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="password"
                required
                placeholder="Confirmar"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            {statusSenha.msg && (
              <p
                className={`text-xs font-bold text-center ${statusSenha.tipo === "erro" ? "text-red-500" : statusSenha.tipo === "sucesso" ? "text-emerald-600" : "text-blue-500"}`}
              >
                {statusSenha.msg}
              </p>
            )}
            <button
              type="submit"
              disabled={statusSenha.tipo === "loading"}
              className="w-full py-2 bg-slate-800 text-white font-semibold rounded-lg text-sm hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              {statusSenha.tipo === "loading"
                ? "Salvando..."
                : "Salvar Nova Senha"}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
