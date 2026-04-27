/**
 * @file Informatica.jsx
 * @description Gestão de inventário de TI (Almoxarifado de Informática).
 * Otimizado para dispositivos móveis com ajuste rápido de estoque.
 * @module Frontend/Pages/TI/Informatica
 */

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Cpu, 
  Monitor, 
  RefreshCw, 
  PlusCircle, 
  MinusCircle, 
  Package,
  HardDrive
} from "lucide-react";
import api from "../../api/api";
import Modal from "../../components/Modal";

export default function Informatica() {
  const [itens, setItens] = useState([]);
  const [setores, setSetores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

  const [novoItem, setNovoItem] = useState({
    nome: "",
    codigoPatrimonio: "",
    quantidadeTotal: 1,
    categoria: "Informática"
  });


  const buscarDados = async () => {
    try {
      setCarregando(true);
      const resSetores = await api.get("/core/setores");
      setSetores(resSetores.data);
      
      const idTI = resSetores.data.find(s => s.nome === "TI")?.id;
      
      // Busca apenas itens vinculados ao setor TI
      const resItens = await api.get(`/almoxarifado/ferramentas?setorId=${idTI || ''}`);
      setItens(resItens.data);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const handleCriarItem = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      const idTI = setores.find(s => s.nome === "TI")?.id;
      
      await api.post("/almoxarifado/ferramentas", {
        ...novoItem,
        setorId: idTI
      });
      
      setModalCadastroAberto(false);
      setNovoItem({ nome: "", codigoPatrimonio: "", quantidadeTotal: 1, categoria: "Informática" });
      buscarDados();
    } catch (erro) {
      alert("Erro ao cadastrar item.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAjustarEstoque = async (id, variacao) => {
    try {
      await api.patch(`/almoxarifado/ferramentas/${id}/ajustar-estoque`, { variacao });
      // Atualiza localmente para ser instantâneo
      setItens(prev => prev.map(item => 
        item.id === id 
          ? { ...item, quantidadeTotal: item.quantidadeTotal + variacao, qtdDisponivel: item.qtdDisponivel + variacao }
          : item
      ));
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao ajustar estoque.");
    }
  };

  const itensFiltrados = useMemo(() => {
    return itens.filter(i => 
      i.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (i.codigoPatrimonio && i.codigoPatrimonio.toLowerCase().includes(termoBusca.toLowerCase()))
    );
  }, [itens, termoBusca]);

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-600" />
            Almoxarifado de TI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de toners, peças e periféricos da informática.
          </p>
        </div>

        <button
          onClick={() => setModalCadastroAberto(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Novo Item de TI
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar itens de informática..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-base border border-slate-200 rounded-2xl outline-none bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
      </div>

      {/* Lista de Itens (Mobile-First Cards) */}
      <div className="grid grid-cols-1 gap-4">
        {carregando ? (
          <div className="p-12 text-center text-slate-400">Carregando inventário...</div>
        ) : itensFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Nenhum item encontrado.
          </div>
        ) : (
          itensFiltrados.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    {item.nome.toLowerCase().includes('toner') ? <Package /> : <HardDrive />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.nome}</h3>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                      {item.codigoPatrimonio || "Consumível"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">{item.quantidadeTotal}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unidades</p>
                </div>
              </div>

              {/* Controles de Estoque (Grandes para touch) */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAjustarEstoque(item.id, -1)}
                  disabled={item.quantidadeTotal <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl border border-red-100 active:scale-95 transition-all disabled:opacity-30 font-bold"
                >
                  <MinusCircle className="w-5 h-5" /> Saída
                </button>
                <button
                  onClick={() => handleAjustarEstoque(item.id, 1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 active:scale-95 transition-all font-bold"
                >
                  <PlusCircle className="w-5 h-5" /> Entrada
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Cadastro */}
      <Modal
        isOpen={modalCadastroAberto}
        onClose={() => setModalCadastroAberto(false)}
        title="Novo Item de TI"
      >
        <form onSubmit={handleCriarItem} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
            <input
              type="text"
              required
              placeholder="Ex: Toner HP 105A"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={novoItem.nome}
              onChange={e => setNovoItem({...novoItem, nome: e.target.value})}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Patrimônio (opcional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none uppercase"
                value={novoItem.codigoPatrimonio}
                onChange={e => setNovoItem({...novoItem, codigoPatrimonio: e.target.value})}
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-bold text-slate-700 mb-1">Qtd Inicial</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none"
                value={novoItem.quantidadeTotal}
                onChange={e => setNovoItem({...novoItem, quantidadeTotal: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {salvando ? <RefreshCw className="animate-spin" /> : <PlusCircle />}
              Cadastrar no Inventário
            </button>
            <button
              type="button"
              onClick={() => setModalCadastroAberto(false)}
              className="w-full py-4 text-slate-500 font-bold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
