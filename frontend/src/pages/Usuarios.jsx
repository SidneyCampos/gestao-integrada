/**
 * @file Usuarios.jsx
 * @description Interface para administração de usuários, permissões e setores.
 * @module Frontend/Pages/Usuarios
 */

import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  ShieldAlert, 
  RefreshCw, 
  Edit3, 
  Lock, 
  Building2, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle
} from "lucide-react";
import api from "../api/api";
import Modal from "../components/Modal";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  // Modais
  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [modalSetorAberto, setModalSetorAberto] = useState(false);
  
  // Estados de formulário
  const [editandoId, setEditandoId] = useState(null);
  const [novoSetorNome, setNovoSetorNome] = useState("");
  const [usuarioForm, setUsuarioForm] = useState({
    nome: "",
    login: "",
    senha: "",
    isAdmin: false,
    setoresIds: []
  });

  const buscarDados = async () => {
    try {
      setCarregando(true);
      const [resUsers, resSetores] = await Promise.all([
        api.get("/core/usuarios"),
        api.get("/core/setores")
      ]);
      setUsuarios(resUsers.data);
      setSetores(resSetores.data);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // --- AÇÕES DE USUÁRIO ---

  const abrirNovoUsuario = () => {
    setEditandoId(null);
    setUsuarioForm({ nome: "", login: "", senha: "", isAdmin: false, setoresIds: [] });
    setModalUsuarioAberto(true);
  };

  const abrirEdicaoUsuario = (u) => {
    setEditandoId(u.id);
    setUsuarioForm({
      nome: u.nome,
      login: u.login,
      senha: "", // Não carrega a senha por segurança
      isAdmin: u.isAdmin,
      setoresIds: u.setores.map(s => s.id)
    });
    setModalUsuarioAberto(true);
  };

  const handleSalvarUsuario = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      if (editandoId) {
        await api.put(`/core/usuarios/${editandoId}`, usuarioForm);
      } else {
        await api.post("/core/usuarios", usuarioForm);
      }
      setModalUsuarioAberto(false);
      buscarDados();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao salvar usuário.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente remover este acesso?")) return;
    try {
      await api.delete(`/core/usuarios/${id}`);
      buscarDados();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao excluir.");
    }
  };

  const toggleSetor = (setorId) => {
    const ids = [...usuarioForm.setoresIds];
    const index = ids.indexOf(setorId);
    if (index > -1) ids.splice(index, 1);
    else ids.push(setorId);
    setUsuarioForm({ ...usuarioForm, setoresIds: ids });
  };

  // --- AÇÕES DE SETOR ---

  const handleCriarSetor = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await api.post("/core/setores", { nome: novoSetorNome });
      setModalSetorAberto(false);
      setNovoSetorNome("");
      buscarDados();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao criar setor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
              <Users className="w-6 h-6 text-white" />
            </div>
            Gestão de Acessos
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Controle de usuários, setores e privilégios administrativos.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setModalSetorAberto(true)}
            className="flex-1 md:flex-none border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            Novo Setor
          </button>
          <button
            onClick={abrirNovoUsuario}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-20 text-center text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">Sincronizando Dados...</div>
        ) : (
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                <th className="px-8 py-5">Servidor / Login</th>
                <th className="px-8 py-5 text-center">Perfil</th>
                <th className="px-8 py-5">Setores Autorizados</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 block lg:table-row-group">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors block lg:table-row group">
                  {/* MOBILE VIEW (CARD) */}
                  <td className="lg:hidden p-5 block">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${u.isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{u.nome}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">{u.login}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => abrirEdicaoUsuario(u)} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletar(u.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      {u.isAdmin ? (
                        <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm shadow-purple-100">
                          <ShieldAlert className="w-3 h-3" /> Admin Geral
                        </span>
                      ) : (
                        u.setores.map(s => (
                          <span key={s.id} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold border border-slate-200 uppercase tracking-tighter">
                            {s.nome}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* DESKTOP VIEW */}
                  <td className="px-8 py-5 hidden lg:table-cell">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${u.isAdmin ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.nome}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">{u.login}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 hidden lg:table-cell text-center">
                    {u.isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-tighter border border-purple-200">
                        <ShieldAlert className="w-3.5 h-3.5" /> Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Servidor
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {!u.isAdmin && u.setores.length === 0 && <span className="text-[10px] text-slate-400 italic font-medium">Nenhum setor atribuído</span>}
                      {!u.isAdmin && u.setores.map(s => (
                        <span key={s.id} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-black uppercase border border-slate-200 tracking-tighter">
                          {s.nome}
                        </span>
                      ))}
                      {u.isAdmin && <span className="text-[10px] text-purple-400 font-bold italic">Acesso completo a todos os módulos</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 hidden lg:table-cell text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => abrirEdicaoUsuario(u)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar Usuário"
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDeletar(u.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: USUÁRIO */}
      <Modal
        isOpen={modalUsuarioAberto}
        onClose={() => setModalUsuarioAberto(false)}
        title={editandoId ? "Editar Credenciais" : "Cadastrar Novo Servidor"}
        variant={usuarioForm.isAdmin ? "blue" : "primary"}
      >
        <form onSubmit={handleSalvarUsuario} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-bold text-sm transition-all"
                placeholder="João da Silva"
                value={usuarioForm.nome}
                onChange={(e) => setUsuarioForm({ ...usuarioForm, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login de Acesso</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-mono text-sm transition-all"
                    placeholder="login.servidor"
                    value={usuarioForm.login}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, login: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {editandoId ? "Nova Senha (opcional)" : "Senha Inicial"}
                </label>
                <input
                  type="password"
                  required={!editandoId}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-bold text-sm transition-all"
                  placeholder="******"
                  value={usuarioForm.senha}
                  onChange={(e) => setUsuarioForm({ ...usuarioForm, senha: e.target.value })}
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-200 transition-all"
                  checked={usuarioForm.isAdmin}
                  onChange={(e) => setUsuarioForm({ ...usuarioForm, isAdmin: e.target.checked })}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">Administrador Geral</span>
                  <span className="text-[10px] text-slate-400 font-medium">Permite acesso a todos os módulos e configurações.</span>
                </div>
              </label>

              {!usuarioForm.isAdmin && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atribuir Módulos de Acesso</p>
                  <div className="flex flex-wrap gap-2">
                    {setores.length === 0 && <p className="text-[10px] text-slate-400 italic">Nenhum setor cadastrado.</p>}
                    {setores.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSetor(s.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${usuarioForm.setoresIds.includes(s.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'}`}
                      >
                        {s.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModalUsuarioAberto(false)}
              className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {salvando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> {editandoId ? "Atualizar Dados" : "Criar Acesso"}</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: NOVO SETOR */}
      <Modal
        isOpen={modalSetorAberto}
        onClose={() => setModalSetorAberto(false)}
        title="Cadastrar Novo Módulo/Setor"
      >
        <form onSubmit={handleCriarSetor} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Setor</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-bold text-base transition-all"
              placeholder="Ex: TI, ALMOXARIFADO, RH"
              value={novoSetorNome}
              onChange={(e) => setNovoSetorNome(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 font-medium italic mt-2">
              * O nome do setor será usado como base para as permissões de acesso.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModalSetorAberto(false)}
              className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {salvando ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Criar Setor"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
