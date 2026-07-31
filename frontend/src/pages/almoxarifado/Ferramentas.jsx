/**
 * @file Ferramentas.jsx
 * @description Interface completa para gestão de inventário e empréstimos de ferramentas.
 * Possui abas de "Estoque" (com CRUD de ferramentas) e "Empréstimos" (histórico de saídas).
 * @module Frontend/Pages/Almoxarifado/Ferramentas
 */

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Wrench,
  MoreVertical,
  RefreshCw,
  X,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Trash2,
  Users,
  Package,
  History,
  Edit3,
} from "lucide-react";
import api from "../../api/api";
import Modal from "../../components/Modal";
import useTabelaOrdenavel from "../../hooks/useTabelaOrdenavel";
import HeaderOrdenavel from "../../components/HeaderOrdenavel";

export default function Ferramentas() {
  // ================= ESTADOS DO SISTEMA =================
  const [abaAtiva, setAbaAtiva] = useState("estoque"); // Pode ser 'estoque' ou 'emprestimos'

  const [ferramentas, setFerramentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [funcionariosExternos, setFuncionariosExternos] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]); // Guarda o histórico do banco

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalEmprestimoAberto, setModalEmprestimoAberto] = useState(false);
  const [modalRapidoFuncionario, setModalRapidoFuncionario] = useState(false);

  const [ferramentaSelecionada, setFerramentaSelecionada] = useState(null);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);
  const [usuarioIdSelecionado, setUsuarioIdSelecionado] = useState("");
  const [qtdEmprestimoSelecionada, setQtdEmprestimoSelecionada] = useState(1); // NOVA LINHA AQUI

  const [novaFerramenta, setNovaFerramenta] = useState({
    nome: "",
    codigoPatrimonio: "",
    quantidadeTotal: 1,
  });

  const [menuAbertoId, setMenuAbertoId] = useState(null);

  // Fecha o menu de opções ao clicar fora dele
  useEffect(() => {
    const handleCliqueFora = () => setMenuAbertoId(null);
    window.addEventListener("click", handleCliqueFora);
    return () => window.removeEventListener("click", handleCliqueFora);
  }, []);

  // ================= FUNÇÕES DE BUSCA (API) =================
  /**
   * Busca no banco de dados todas as ferramentas, usuários (para listar no select) e empréstimos.
   * Executada sempre que a tela carrega e após cada operação de cadastro/empréstimo.
   */
  const buscarDadosIniciais = async () => {
    try {
      setCarregando(true);
      // Busca ferramentas, usuários e empréstimos!
      const resFerramentas = await api.get("/almoxarifado/ferramentas?excluirCategoria=Informática");
      const resUsuarios = await api.get("/core/usuarios");
      const resFuncionarios = await api.get("/almoxarifado/funcionarios");
      const resEmprestimos = await api.get("/almoxarifado/emprestimos");

      setFerramentas(resFerramentas.data);
      // Unifica os usuários do sistema com os funcionários externos para o Almoxarifado
      setUsuarios([...resUsuarios.data, ...resFuncionarios.data]);
      setFuncionariosExternos(resFuncionarios.data);
      setEmprestimos(resEmprestimos.data);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao buscar dados. O servidor backend está rodando?");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDadosIniciais();
  }, []);

  // ================= FUNÇÕES DE AÇÃO =================
  /**
   * Envia os dados do formulário do modal para a API criar uma nova ferramenta.
   */
  const handleCriarFerramenta = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await api.post("/almoxarifado/ferramentas", {
        nome: novaFerramenta.nome,
        codigoPatrimonio: novaFerramenta.codigoPatrimonio,
        quantidadeTotal: parseInt(novaFerramenta.quantidadeTotal),
        categoria: "Ferramenta",
      });
      setModalCadastroAberto(false);
      setNovaFerramenta({ nome: "", codigoPatrimonio: "", quantidadeTotal: 1 });
      buscarDadosIniciais();
    } catch (erro) {
      alert("Erro ao salvar a ferramenta.");
    } finally {
      setSalvando(false);
    }
  };

  const handleEmprestar = async (e) => {
    e.preventDefault();
    if (!usuarioIdSelecionado) return alert("Selecione um funcionário.");

    try {
      setSalvando(true);
      await api.post("/almoxarifado/emprestimos", {
        usuarioId: parseInt(usuarioIdSelecionado),
        ferramentaId: ferramentaSelecionada.id,
        quantidade: parseInt(qtdEmprestimoSelecionada),
      });
      setModalEmprestimoAberto(false);
      setUsuarioIdSelecionado("");
      buscarDadosIniciais();

      // Muda a aba automaticamente para mostrar o empréstimo feito!
      setAbaAtiva("emprestimos");
    } catch (erro) {
      alert(
        erro.response?.data?.erro || "Erro interno ao realizar empréstimo.",
      );
    } finally {
      setSalvando(false);
    }
  };

  /**
   * Cadastro rápido de funcionário externo (sem acesso ao sistema).
   */
  const handleCriarFuncionarioRapido = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value;
    const telefone = e.target.telefone.value;

    try {
      setSalvando(true);
      if (funcionarioEditando) {
        await api.put(`/almoxarifado/funcionarios/${funcionarioEditando.id}`, { nome, telefone });
      } else {
        const res = await api.post("/almoxarifado/funcionarios", { nome, telefone });
        setUsuarioIdSelecionado(res.data.id);
      }
      
      setModalRapidoFuncionario(false);
      setFuncionarioEditando(null);
      await buscarDadosIniciais(); // Atualiza tudo
      setAbaAtiva("equipe"); // Manda para a aba da equipe externa
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao processar funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  /**
   * Remove um funcionário externo do banco.
   */
  const handleDeletarFuncionario = async (id) => {
    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.")) return;

    try {
      setCarregando(true);
      await api.delete(`/almoxarifado/funcionarios/${id}`);
      buscarDadosIniciais();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao excluir funcionário.");
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Remove uma ferramenta do banco.
   */
  const handleDeletarFerramenta = async (id) => {
    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja excluir esta ferramenta? Esta ação não pode ser desfeita e só é permitida se não houver histórico de uso.")) return;

    try {
      setCarregando(true);
      await api.delete(`/almoxarifado/ferramentas/${id}`);
      buscarDadosIniciais();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao excluir ferramenta.");
    } finally {
      setCarregando(false);
    }
  };

  // NOVA FUNÇÃO: Devolver Ferramenta
  /**
   * Dispara a devolução de uma ferramenta pendente, restaurando o estoque.
   * @param {number} emprestimoId - ID do empréstimo a ser finalizado.
   */
  const handleDevolver = async (emprestimoId) => {
    if (!window.confirm("Confirmar a devolução desta ferramenta?")) return;

    try {
      setCarregando(true);
      // Chama nossa rota PATCH que criamos no backend
      await api.patch(
        `/almoxarifado/emprestimos/${emprestimoId}/devolver`,
      );
      buscarDadosIniciais(); // Atualiza tudo (o status vai para devolvido e a qtd aumenta)
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao devolver.");
    } finally {
      setCarregando(false);
    }
  };

  // Função para formatar a data que vem feia do banco de dados
  const formatarData = (dataStr) => {
    if (!dataStr) return "-";
    const data = new Date(dataStr);
    return (
      data.toLocaleDateString("pt-BR") +
      " às " +
      data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Auxiliar para identificar se um item pertence ao setor ou categoria de TI/Informática
  const ehItemTI = (item) => {
    if (!item) return false;
    const cat = (item.categoria || '').toLowerCase();
    const setorNome = (item.setor?.nome || '').toLowerCase();
    return cat === 'informática' || cat === 'informatica' || cat === 'ti' || setorNome === 'ti';
  };

  // ================= LÓGICA DE BUSCA FILTRADA =================
  const ferramentasFiltradas = useMemo(() => {
    return ferramentas.filter(f => 
      !ehItemTI(f) && (
        f.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (f.codigoPatrimonio && f.codigoPatrimonio.toLowerCase().includes(termoBusca.toLowerCase()))
      )
    );
  }, [ferramentas, termoBusca]);

  const emprestimosFiltrados = useMemo(() => {
    return emprestimos.filter(e => 
      !ehItemTI(e.ferramenta) && (
        e.usuario?.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        e.ferramenta?.nome.toLowerCase().includes(termoBusca.toLowerCase())
      )
    );
  }, [emprestimos, termoBusca]);

  const equipeFiltrada = useMemo(() => {
    return funcionariosExternos.filter(f => 
      f.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (f.telefone && f.telefone.includes(termoBusca))
    );
  }, [funcionariosExternos, termoBusca]);

  const { dadosOrdenados: ferramentasExibidas, sortConfig: sortEstoque, alternarOrdenacao: onSortEstoque } = useTabelaOrdenavel(ferramentasFiltradas);
  const { dadosOrdenados: emprestimosExibidos, sortConfig: sortEmprestimos, alternarOrdenacao: onSortEmprestimos } = useTabelaOrdenavel(emprestimosFiltrados);
  const { dadosOrdenados: equipeExibida, sortConfig: sortEquipe, alternarOrdenacao: onSortEquipe } = useTabelaOrdenavel(equipeFiltrada);

  return (
    <div className="space-y-6 relative">
      {/* ================= CABEÇALHO ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            Controle de Ferramentas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o acervo e o status das ferramentas do setor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={buscarDadosIniciais}
            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            title="Atualizar Dados"
          >
            <RefreshCw
              className={`w-5 h-5 ${carregando ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
          
          <div className="flex flex-1 gap-2">
            <button
              onClick={() => setModalRapidoFuncionario(true)}
              className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span className="hidden xs:inline">Equipe</span>
              <span className="xs:hidden">Equipe</span>
            </button>

            <button
              onClick={() => setModalCadastroAberto(true)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline text-nowrap">Nova Ferramenta</span>
              <span className="xs:hidden">Ferramenta</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= NAVEGAÇÃO POR ABAS (TABS) ================= */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-2xl w-full max-w-xl shadow-inner border border-slate-300/30 backdrop-blur-sm">
        <button
          onClick={() => setAbaAtiva("estoque")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${abaAtiva === "estoque" ? "bg-white text-blue-600 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/40"}`}
        >
          <Package className={`w-4 h-4 ${abaAtiva === "estoque" ? "text-blue-600" : "text-slate-400"}`} />
          <span className="hidden sm:inline">Acervo e Estoque</span>
          <span className="sm:hidden">Estoque</span>
        </button>
        
        <button
          onClick={() => setAbaAtiva("emprestimos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${abaAtiva === "emprestimos" ? "bg-white text-blue-600 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/40"}`}
        >
          <History className={`w-4 h-4 ${abaAtiva === "emprestimos" ? "text-blue-600" : "text-slate-400"}`} />
          <span className="hidden sm:inline">Histórico / Devolução</span>
          <span className="sm:hidden">Histórico</span>
        </button>

        <button
          onClick={() => setAbaAtiva("equipe")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${abaAtiva === "equipe" ? "bg-white text-blue-600 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/40"}`}
        >
          <Users className={`w-4 h-4 ${abaAtiva === "equipe" ? "text-blue-600" : "text-slate-400"}`} />
          <span className="hidden sm:inline">Equipe Externa</span>
          <span className="sm:hidden">Equipe</span>
        </button>
      </div>

      {/* ================= ÁREA DE CONTEÚDO (TABELA OU CARTÕES) ================= */}
      <div className="bg-transparent lg:bg-white lg:border lg:border-slate-200 rounded-xl lg:shadow-sm overflow-visible pb-32 lg:pb-0">
        <div className="p-0 pb-4 lg:p-4 lg:border-b border-slate-200 lg:bg-slate-50 flex items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Pesquisar em ${abaAtiva === 'estoque' ? 'Estoque' : abaAtiva === 'equipe' ? 'Equipe' : 'Histórico'}...`}
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-3 lg:py-2 text-sm border border-slate-300 rounded-lg lg:rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

      {/* ================= ABA: EQUIPE EXTERNA ================= */}
      {abaAtiva === "equipe" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Funcionários Cadastrados</h3>
            <p className="text-xs text-slate-500">Pessoas que não acessam o sistema, mas retiram ferramentas.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <HeaderOrdenavel campo="nome" label="Nome" sortConfig={sortEquipe} onSort={onSortEquipe} />
                  <HeaderOrdenavel campo="telefone" label="Telefone" sortConfig={sortEquipe} onSort={onSortEquipe} />
                  <HeaderOrdenavel label="Ações" align="right" desabilitado />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipeExibida.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">
                      {termoBusca ? "Nenhum funcionário encontrado com esse termo." : "Nenhum funcionário externo cadastrado."}
                    </td>
                  </tr>
                ) : (
                  equipeExibida.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{f.nome}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{f.telefone || "---"}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => {
                            setFuncionarioEditando(f);
                            setModalRapidoFuncionario(true);
                          }}
                          className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletarFuncionario(f.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {carregando ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">
            Sincronizando...
          </div>
        ) : (
          <div className="w-full">
            {/* ================= CONTEÚDO DA ABA: ESTOQUE ================= */}
            {abaAtiva === "estoque" && (
              <>
                <table className="w-full text-left border-collapse block lg:table">
                  <thead className="hidden lg:table-header-group">
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold block lg:table-row">
                      <HeaderOrdenavel campo="codigoPatrimonio" label="Patrimônio" sortConfig={sortEstoque} onSort={onSortEstoque} />
                      <HeaderOrdenavel campo="nome" label="Descrição" sortConfig={sortEstoque} onSort={onSortEstoque} />
                      <HeaderOrdenavel campo="quantidadeTotal" label="Total" align="center" sortConfig={sortEstoque} onSort={onSortEstoque} />
                      <HeaderOrdenavel campo="quantidadeDisponivel" label="Disponível" align="center" sortConfig={sortEstoque} onSort={onSortEstoque} />
                      <HeaderOrdenavel campo="status" label="Status" sortConfig={sortEstoque} onSort={onSortEstoque} />
                      <HeaderOrdenavel label="Opções" align="right" desabilitado />
                    </tr>
                  </thead>
                  <tbody className="grid grid-cols-1 lg:table-row-group lg:divide-y divide-slate-200 text-sm text-slate-700 gap-4 lg:gap-0 relative">
                    {ferramentasExibidas.length === 0 && (
                      <tr className="lg:table-row">
                         <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">
                           Nenhuma ferramenta encontrada.
                         </td>
                      </tr>
                    )}
                    {ferramentasExibidas.map((ferramenta) => (
                      <tr
                        key={ferramenta.id}
                        className="block lg:table-row bg-white border border-slate-200 lg:border-none rounded-xl lg:rounded-none shadow-sm lg:shadow-none hover:bg-slate-50 relative"
                      >
                        <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell border-b border-slate-100 lg:border-none">
                          <span className="lg:hidden text-xs font-bold uppercase text-slate-400">
                            Patrimônio
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {ferramenta.codigoPatrimonio || "S/N"}
                          </span>
                        </td>
                        <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell font-bold text-slate-900 border-b border-slate-100 lg:border-none gap-4">
                          <span className="lg:hidden text-[10px] font-extrabold uppercase text-slate-400 min-w-fit">
                            Descrição
                          </span>
                          <span className="text-right lg:text-left">{ferramenta.nome}</span>
                        </td>
                        <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell lg:text-center border-b border-slate-100 lg:border-none">
                          <span className="lg:hidden text-xs font-bold uppercase text-slate-400">
                            Total
                          </span>
                          {ferramenta.quantidadeTotal}
                        </td>
                        <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell lg:text-center font-bold border-b border-slate-100 lg:border-none">
                          <span className="lg:hidden text-xs font-bold uppercase text-slate-400">
                            Disponível
                          </span>
                          <span
                            className={`text-lg lg:text-sm ${ferramenta.qtdDisponivel > 0 ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {ferramenta.qtdDisponivel}
                          </span>
                        </td>
                        <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell border-b border-slate-100 lg:border-none">
                          <span className="lg:hidden text-xs font-bold uppercase text-slate-400">
                            Status
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${ferramenta.qtdDisponivel > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                          >
                            {ferramenta.qtdDisponivel > 0
                              ? "Em Estoque"
                              : "Esgotado"}
                          </span>
                        </td>
                        <td className="px-4 py-3 lg:py-2 block lg:table-cell border-b border-slate-100 lg:border-none bg-slate-50/50 lg:bg-transparent">
                          <div className="flex items-center justify-end gap-2 lg:gap-3">
                            <button
                              disabled={ferramenta.qtdDisponivel <= 0}
                              onClick={() => {
                                setFerramentaSelecionada(ferramenta);
                                setModalEmprestimoAberto(true);
                              }}
                              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 lg:py-1.5 bg-blue-600 lg:bg-blue-50 text-white lg:text-blue-700 hover:bg-blue-700 lg:hover:bg-blue-600 lg:hover:text-white rounded-lg transition-all font-bold text-xs border border-blue-600 lg:border-blue-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm lg:shadow-none"
                            >
                              <ArrowRightLeft className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                              Emprestar
                            </button>
                            
                            {/* MENU DE GERENCIAMENTO (3 PONTINHOS) */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Evita que o listener de clique fora feche o menu imediatamente
                                  setMenuAbertoId(menuAbertoId === ferramenta.id ? null : ferramenta.id);
                                }}
                                className={`p-2 rounded-lg transition-all ${menuAbertoId === ferramenta.id ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                                title="Gerenciar Ferramenta"
                              >
                                <MoreVertical className="w-5 h-5 lg:w-4 lg:h-4" />
                              </button>

                              {menuAbertoId === ferramenta.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opções</p>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleDeletarFerramenta(ferramenta.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir Item
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Espaço extra para mobile no final da lista */}
              </>
            )}

            {/* ================= CONTEÚDO DA ABA: EMPRÉSTIMOS E HISTÓRICO ================= */}
            {abaAtiva === "emprestimos" && (
              <table className="w-full text-left border-collapse block lg:table">
                <thead className="hidden lg:table-header-group">
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold block lg:table-row">
                    <HeaderOrdenavel campo="usuario.nome" label="Funcionário" sortConfig={sortEmprestimos} onSort={onSortEmprestimos} />
                    <HeaderOrdenavel campo="ferramenta.nome" label="Ferramenta" sortConfig={sortEmprestimos} onSort={onSortEmprestimos} />
                    <HeaderOrdenavel campo="dataEmprestimo" label="Saída" sortConfig={sortEmprestimos} onSort={onSortEmprestimos} />
                    <HeaderOrdenavel campo="status" label="Status" sortConfig={sortEmprestimos} onSort={onSortEmprestimos} />
                    <HeaderOrdenavel label="Ação" align="right" desabilitado />
                  </tr>
                </thead>
                <tbody className="grid grid-cols-1 md:grid-cols-2 lg:table-row-group lg:divide-y divide-slate-200 text-sm text-slate-700 gap-4 lg:gap-0 relative">
                  {emprestimosExibidos.length === 0 && (
                    <tr className="block lg:table-row">
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-500 block lg:table-cell"
                      >
                        {termoBusca ? "Nenhum resultado para esta busca." : "Nenhum registro de empréstimo encontrado."}
                      </td>
                    </tr>
                  )}

                  {emprestimosExibidos.map((emp) => (
                    <tr
                      key={emp.id}
                      className="block lg:table-row bg-white border border-slate-200 lg:border-none rounded-xl lg:rounded-none shadow-sm lg:shadow-none hover:bg-slate-50 relative"
                    >
                      <td className="px-4 py-3 lg:py-2 flex flex-col items-start lg:table-cell border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden text-xs font-bold uppercase text-slate-400 mb-1">
                          Funcionário
                        </span>
                        <span className="font-bold text-slate-800">
                          {emp.usuario.nome}
                        </span>
                      </td>
                      <td className="px-4 py-3 lg:py-2 flex flex-col items-start lg:table-cell font-medium text-slate-700 border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden text-xs font-bold uppercase text-slate-400 mb-1">
                          Ferramenta
                        </span>
                        {emp.ferramenta.nome}
                      </td>
                      <td className="px-4 py-3 lg:py-2 flex flex-col items-start lg:table-cell border-b border-slate-100 lg:border-none text-slate-500">
                        <span className="lg:hidden text-xs font-bold uppercase text-slate-400 mb-1">
                          Data Saída
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{" "}
                          {formatarData(emp.dataSaida)}
                        </div>
                      </td>
                      <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden text-xs font-bold uppercase text-slate-400">
                          Status
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${emp.status === "PENDENTE" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 lg:py-2 flex justify-end lg:table-cell text-right">
                        {emp.status === "PENDENTE" ? (
                          <button
                            onClick={() => handleDevolver(emp.id)}
                            className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg w-full lg:w-auto justify-center transition-colors font-semibold text-xs border border-emerald-200"
                          >
                            <CheckCircle className="w-4 h-4" /> Devolver Agora
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic block w-full text-center lg:text-right">
                            Devolvido em:
                            <br className="lg:hidden" />{" "}
                            {formatarData(emp.dataDevolucao)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* (O Código dos Modais de Cadastro e Empréstimo continuam iguais aqui embaixo, omiti no resumo para focar na aba, MAS VOCÊ DEVE MANTER O CÓDIGO DELES IGUAL ESTAVA ANTES NO FINAL DO ARQUIVO) */}

      {/* ================= MODAL: CADASTRAR FERRAMENTA ================= */}
      <Modal
        isOpen={modalCadastroAberto}
        onClose={() => setModalCadastroAberto(false)}
        title="Cadastrar Ferramenta"
      >
        <form onSubmit={handleCriarFerramenta} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Descrição / Nome *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lixadeira Angular Dewalt"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              onChange={(e) =>
                setNovaFerramenta({
                  ...novaFerramenta,
                  nome: e.target.value,
                })
              }
              value={novaFerramenta.nome}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Cód. Patrimônio
              </label>
              <input
                type="text"
                placeholder="Ex: LX-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none uppercase"
                onChange={(e) =>
                  setNovaFerramenta({
                    ...novaFerramenta,
                    codigoPatrimonio: e.target.value,
                  })
                }
                value={novaFerramenta.codigoPatrimonio}
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                onChange={(e) =>
                  setNovaFerramenta({
                    ...novaFerramenta,
                    quantidadeTotal: e.target.value,
                  })
                }
                value={novaFerramenta.quantidadeTotal}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalCadastroAberto(false)}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Salvar Ferramenta
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: EMPRESTAR FERRAMENTA ================= */}
      <Modal
        isOpen={modalEmprestimoAberto && !!ferramentaSelecionada}
        onClose={() => setModalEmprestimoAberto(false)}
        title="Registrar Empréstimo"
        variant="blue"
      >
        <form onSubmit={handleEmprestar} className="space-y-5">
          {/* Resumo da Ferramenta Escolhida */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Ferramenta Solicitada
            </p>
            <p className="font-bold text-slate-800 text-lg">
              {ferramentaSelecionada?.nome}
            </p>
            <p className="text-sm text-slate-600">
              Patrimônio: {ferramentaSelecionada?.codigoPatrimonio || "S/N"}
            </p>
          </div>

          {/* Seleção de Funcionário e Quantidade */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Para qual funcionário?
              </label>
              <div className="flex items-center gap-2">
                <select
                  required
                  value={usuarioIdSelecionado}
                  onChange={(e) => setUsuarioIdSelecionado(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                >
                  <option value="" disabled>
                    Selecione da lista...
                  </option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} {u.isSistema ? "(Servidor)" : "(Externo)"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setModalRapidoFuncionario(true)}
                  className="p-3 sm:p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  title="Novo Funcionário Externo"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full sm:w-24">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Qtd.
              </label>
              <input
                type="number"
                min="1"
                max={ferramentaSelecionada?.qtdDisponivel}
                required
                className="w-full px-3 py-3 sm:py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setQtdEmprestimoSelecionada(e.target.value)
                }
                value={qtdEmprestimoSelecionada}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalEmprestimoAberto(false)}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {salvando ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Confirmar Saída"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: CADASTRO/EDIÇÃO DE FUNCIONÁRIO ================= */}
      <Modal
        isOpen={modalRapidoFuncionario}
        onClose={() => {
          setModalRapidoFuncionario(false);
          setFuncionarioEditando(null);
        }}
        title={funcionarioEditando ? "Editar Funcionário Externo" : "Cadastrar Funcionário Externo"}
      >
        <form onSubmit={handleCriarFuncionarioRapido} className="space-y-4">
          <p className="text-xs text-slate-500">
            {funcionarioEditando 
              ? "Atualize os dados do funcionário para controle de empréstimos."
              : "Este cadastro é apenas para controle de empréstimos. Este funcionário **não** terá acesso ao sistema."}
          </p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input 
              name="nome" 
              type="text" 
              required 
              defaultValue={funcionarioEditando?.nome}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
            <input 
              name="telefone" 
              type="text" 
              defaultValue={funcionarioEditando?.telefone}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => {
                setModalRapidoFuncionario(false);
                setFuncionarioEditando(null);
              }} 
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              {salvando ? "Salvando..." : (funcionarioEditando ? "Atualizar Dados" : "Confirmar Cadastro")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
