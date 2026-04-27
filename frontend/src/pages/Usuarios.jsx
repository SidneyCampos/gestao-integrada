/**
 * @file Usuarios.jsx
 * @description Interface para administração de usuários e permissões.
 * Exclusiva para usuários com perfil Administrador.
 * @module Frontend/Pages/Usuarios
 */

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Shield, ShieldAlert, RefreshCw } from "lucide-react";
import api from "../api/api";
import Modal from "../components/Modal";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const [novoUsuario, setNovoUsuario] = useState({
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

  const handleCriar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await api.post("/core/usuarios", novoUsuario);
      setModalAberto(false);
      setNovoUsuario({ nome: "", login: "", senha: "", isAdmin: false, setoresIds: [] });
      buscarDados();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao criar usuário.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await api.delete(`/core/usuarios/${id}`);
      buscarDados();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao excluir.");
    }
  };

  const toggleSetor = (setorId) => {
    const ids = [...novoUsuario.setoresIds];
    const index = ids.indexOf(setorId);
    if (index > -1) ids.splice(index, 1);
    else ids.push(setorId);
    setNovoUsuario({ ...novoUsuario, setoresIds: ids });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gestão de Usuários
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle quem acessa o sistema e quais são seus privilégios.
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Carregando usuários...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                <th className="px-6 py-4">Servidor</th>
                <th className="px-6 py-4">Login</th>
                <th className="px-6 py-4">Setores / Acesso</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{u.nome}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.login}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.isAdmin ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> ADMIN GERAL
                        </span>
                      ) : (
                        u.setores.map(s => (
                          <span key={s.id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">
                            {s.nome}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeletar(u.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Cadastrar Novo Servidor"
      >
        <form onSubmit={handleCriar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: João da Silva"
              value={novoUsuario.nome}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Login</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="login.servidor"
                value={novoUsuario.login}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, login: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Inicial</label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="******"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer group mb-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={novoUsuario.isAdmin}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, isAdmin: e.target.checked })}
              />
              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                Administrador Geral (Acesso Total)
              </span>
            </label>

            {!novoUsuario.isAdmin && (
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Atribuir Setores</p>
                <div className="flex flex-wrap gap-2">
                  {setores.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSetor(s.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${novoUsuario.setoresIds.includes(s.id) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
                    >
                      {s.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalAberto(false)}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2"
            >
              {salvando ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Salvar Usuário"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
