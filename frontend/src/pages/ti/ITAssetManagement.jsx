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
  HardDrive,
  History,
  User,
  ArrowRight
} from "lucide-react";
import api from "../../api/api";
import Modal from "../../components/Modal";

export default function ITAssetManagement() {
  const [itens, setItens] = useState([]);
  const [setores, setSetores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  
  // Estados para Saída Rastreável
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalSaidaAberto, setModalSaidaAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [usuarioIdSelecionado, setUsuarioIdSelecionado] = useState("");
  const [quantidadeSaida, setQuantidadeSaida] = useState(1);

  const [novoItem, setNovoItem] = useState({
    nome: "",
    codigoPatrimonio: "",
    quantidadeTotal: 1,
    categoria: "INFORMÁTICA"
  });

  const buscarDados = async () => {
    try {
      setCarregando(true);
      const [resSetores, resUsuarios, resEmprestimos] = await Promise.all([
        api.get("/core/setores"),
        api.get("/core/usuarios"),
        api.get("/almoxarifado/emprestimos")
      ]);

      setSetores(resSetores.data);
      setUsuarios(resUsuarios.data);
      
      const idTI = resSetores.data.find(s => s.nome === "TI")?.id;
      
      // Busca apenas itens vinculados ao setor TI
      const resItens = await api.get(`/almoxarifado/ferramentas?setorId=${idTI || ''}`);
      setItens(resItens.data);

      // Filtra o histórico para mostrar apenas consumos de itens de TI
      const historicoTI = resEmprestimos.data.filter(e => 
        e.status === "CONSUMIDO" && e.ferramenta.categoria === "INFORMÁTICA"
      );
      setHistorico(historicoTI);

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
      setNovoItem({ nome: "", codigoPatrimonio: "", quantidadeTotal: 1, categoria: "INFORMÁTICA" });
      buscarDados();
    } catch (erro) {
      alert("Erro ao cadastrar item.");
    } finally {
      setSalvando(false);
    }
  };

  // Ajuste rápido (apenas entrada agora é direta)
  const handleEntradaDireta = async (id) => {
    try {
      await api.patch(`/almoxarifado/ferramentas/${id}/ajustar-estoque`, { variacao: 1 });
      buscarDados();
    } catch (erro) {
      alert("Erro ao processar entrada.");
    }
  };

  const handleConfirmarSaida = async (e) => {
    e.preventDefault();
    if (!usuarioIdSelecionado) return alert("Selecione o funcionário/setor de destino.");
    
    try {
      setSalvando(true);
      await api.patch(`/almoxarifado/ferramentas/${itemSelecionado.id}/ajustar-estoque`, { 
        variacao: -Math.abs(quantidadeSaida),
        usuarioId: parseInt(usuarioIdSelecionado)
      });
      
      setModalSaidaAberto(false);
      setItemSelecionado(null);
      setUsuarioIdSelecionado("");
      setQuantidadeSaida(1);
      buscarDados();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao registrar saída.");
    } finally {
      setSalvando(false);
    }
  };

  const itensFiltrados = useMemo(() => {
    return itens.filter(i => 
      i.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (i.codigoPatrimonio && i.codigoPatrimonio.toLowerCase().includes(termoBusca.toLowerCase()))
    );
  }, [itens, termoBusca]);

  const formatarData = (dataStr) => {
    return new Date(dataStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
            Gestão de toners, peças e periféricos com rastreabilidade de saída.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={buscarDados}
            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${carregando ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalCadastroAberto(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar estoque de TI..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-base border border-slate-200 rounded-2xl outline-none bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
      </div>

      {/* Tabela de Itens Data-Dense (Responsiva para Mobile) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse block lg:table">
          <thead className="hidden lg:table-header-group">
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-semibold tracking-widest block lg:table-row">
              <th className="px-4 py-3 block lg:table-cell">Descrição do Item</th>
              <th className="px-4 py-3 block lg:table-cell">Tipo</th>
              <th className="px-4 py-3 block lg:table-cell">Patrimônio</th>
              <th className="px-4 py-3 text-center block lg:table-cell">Quantidade Atual</th>
              <th className="px-4 py-3 text-right block lg:table-cell">Ações</th>
            </tr>
          </thead>
          <tbody className="grid grid-cols-1 lg:table-row-group divide-y divide-slate-100 text-sm text-slate-700">
            {carregando ? (
              <tr className="block lg:table-row">
                <td colSpan="5" className="p-12 text-center text-slate-400 block lg:table-cell">Sincronizando inventário...</td>
              </tr>
            ) : itensFiltrados.length === 0 ? (
              <tr className="block lg:table-row">
                <td colSpan="5" className="p-12 text-center text-slate-400 bg-slate-50 block lg:table-cell">
                  Nenhum item encontrado no estoque.
                </td>
              </tr>
            ) : (
              itensFiltrados.map(item => {
                const isConsumable = !item.codigoPatrimonio;
                const Icon = item.nome.toLowerCase().includes('toner') ? Package : HardDrive;
                
                return (
                  <tr key={item.id} className="block lg:table-row bg-white hover:bg-slate-50 transition-colors p-4 lg:p-0 relative">
                    <td className="px-4 py-3 lg:py-2 flex items-center gap-3 lg:table-cell border-b border-slate-100 lg:border-none">
                      <span className="lg:hidden text-xs font-bold uppercase text-slate-400 block w-full mb-1 absolute top-4 left-4">Descrição do Item</span>
                      <div className="flex items-center gap-3 lg:mt-0 mt-6 w-full">
                        <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center text-indigo-600 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 leading-tight block">{item.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell border-b border-slate-100 lg:border-none">
                      <span className="lg:hidden text-xs font-bold uppercase text-slate-400">Tipo</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isConsumable ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isConsumable ? "Consumível" : "Equipamento"}
                      </span>
                    </td>
                    <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell border-b border-slate-100 lg:border-none">
                      <span className="lg:hidden text-xs font-bold uppercase text-slate-400">Patrimônio</span>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {item.codigoPatrimonio || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell lg:text-center border-b border-slate-100 lg:border-none">
                      <span className="lg:hidden text-xs font-bold uppercase text-slate-400">Quantidade Atual</span>
                      <span className={`text-xl lg:text-sm font-black ${item.quantidadeTotal <= 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                        {item.quantidadeTotal}
                      </span>
                    </td>
                    <td className="px-4 py-3 lg:py-2 block lg:table-cell">
                      <div className="flex items-center justify-end gap-2 mt-2 lg:mt-0">
                        <button
                          onClick={() => handleEntradaDireta(item.id)}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 lg:py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all font-bold text-xs border border-emerald-100 shadow-sm lg:shadow-none"
                          title="Entrada Direta (+1)"
                        >
                          <PlusCircle className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                          <span>Entrada</span>
                        </button>
                        <button
                          onClick={() => {
                            setItemSelecionado(item);
                            setModalSaidaAberto(true);
                          }}
                          disabled={item.quantidadeTotal <= 0}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 lg:py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs border border-rose-100 shadow-sm lg:shadow-none"
                          title="Saída (Baixa de Estoque)"
                        >
                          <MinusCircle className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                          <span>Saída</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Histórico de Saídas */}
      <div className="mt-12 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800">Histórico de Entregas (TI)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Destinatário / Setor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historico.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic text-sm">
                    Nenhuma saída registrada recentemente.
                  </td>
                </tr>
              ) : (
                historico.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatarData(h.dataSaida)}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{h.ferramenta.nome}</td>
                    <td className="px-6 py-4 font-black text-indigo-600">-{h.quantidade}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{h.usuario.nome}</span>
                        <span className="text-[10px] text-indigo-500 font-bold uppercase">
                          {h.usuario.setores?.[0]?.nome || "Setor não informado"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Saída Rastreável */}
      <Modal
        isOpen={modalSaidaAberto && !!itemSelecionado}
        onClose={() => setModalSaidaAberto(false)}
        title="Registrar Saída de Material"
        variant="rose"
      >
        <form onSubmit={handleConfirmarSaida} className="space-y-4">
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
            <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Item selecionado</p>
            <p className="font-bold text-rose-900">{itemSelecionado?.nome}</p>
            <p className="text-xs text-rose-700/60">Disponível em estoque: {itemSelecionado?.quantidadeTotal} unid.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                max={itemSelecionado?.quantidadeTotal}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                value={quantidadeSaida}
                onChange={e => setQuantidadeSaida(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entregue para quem?</label>
              <select
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                value={usuarioIdSelecionado}
                onChange={e => setUsuarioIdSelecionado(e.target.value)}
              >
                <option value="">Selecione o servidor...</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
            >
              {salvando ? <RefreshCw className="animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              Confirmar Entrega
            </button>
            <button
              type="button"
              onClick={() => setModalSaidaAberto(false)}
              className="w-full py-4 text-slate-500 font-bold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Cadastro de Item */}
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
