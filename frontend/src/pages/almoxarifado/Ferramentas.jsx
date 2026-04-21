import { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";

export default function Ferramentas() {
  // ================= ESTADOS DO SISTEMA =================
  const [abaAtiva, setAbaAtiva] = useState("estoque"); // Pode ser 'estoque' ou 'emprestimos'

  const [ferramentas, setFerramentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]); // Guarda o histórico do banco

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalEmprestimoAberto, setModalEmprestimoAberto] = useState(false);

  const [ferramentaSelecionada, setFerramentaSelecionada] = useState(null);
  const [usuarioIdSelecionado, setUsuarioIdSelecionado] = useState("");
  const [qtdEmprestimoSelecionada, setQtdEmprestimoSelecionada] = useState(1); // NOVA LINHA AQUI

  const [novaFerramenta, setNovaFerramenta] = useState({
    nome: "",
    codigoPatrimonio: "",
    quantidadeTotal: 1,
  });

  // ================= FUNÇÕES DE BUSCA (API) =================
  const buscarDadosIniciais = async () => {
    try {
      setCarregando(true);
      // Busca ferramentas, usuários e empréstimos!
      const resFerramentas = await axios.get("/api/almoxarifado/ferramentas");
      const resUsuarios = await axios.get("/api/core/usuarios");
      const resEmprestimos = await axios.get("/api/almoxarifado/emprestimos");

      setFerramentas(resFerramentas.data);
      setUsuarios(resUsuarios.data);
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
  const handleCriarFerramenta = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await axios.post("/api/almoxarifado/ferramentas", {
        nome: novaFerramenta.nome,
        codigoPatrimonio: novaFerramenta.codigoPatrimonio,
        quantidadeTotal: parseInt(novaFerramenta.quantidadeTotal),
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
      await axios.post("/api/almoxarifado/emprestimos", {
        usuarioId: parseInt(usuarioIdSelecionado),
        ferramentaId: ferramentaSelecionada.id,
        quantidade: parseInt(qtdEmprestimoSelecionada), // NOVA LINHA AQUI
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

  // NOVA FUNÇÃO: Devolver Ferramenta
  const handleDevolver = async (emprestimoId) => {
    if (!window.confirm("Confirmar a devolução desta ferramenta?")) return;

    try {
      setCarregando(true);
      // Chama nossa rota PATCH que criamos no backend
      await axios.patch(
        `/api/almoxarifado/emprestimos/${emprestimoId}/devolver`,
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

        <div className="flex gap-2">
          <button
            onClick={buscarDadosIniciais}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${carregando ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
          <button
            onClick={() => setModalCadastroAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Ferramenta
          </button>
        </div>
      </div>

      {/* ================= NAVEGAÇÃO POR ABAS (TABS) ================= */}
      <div className="flex bg-slate-200 p-1 rounded-xl w-full max-w-md">
        <button
          onClick={() => setAbaAtiva("estoque")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${abaAtiva === "estoque" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Acervo e Estoque
        </button>
        <button
          onClick={() => setAbaAtiva("emprestimos")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${abaAtiva === "emprestimos" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Empréstimos e Histórico
        </button>
      </div>

      {/* ================= ÁREA DE CONTEÚDO (TABELA OU CARTÕES) ================= */}
      <div className="bg-transparent lg:bg-white lg:border lg:border-slate-200 rounded-xl lg:shadow-sm overflow-visible pb-32 lg:pb-0">
        <div className="p-0 pb-4 lg:p-4 lg:border-b border-slate-200 lg:bg-slate-50 flex items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-9 pr-4 py-3 lg:py-2 text-sm border border-slate-300 rounded-lg lg:rounded-md outline-none bg-white"
            />
          </div>
        </div>

        {carregando ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">
            Sincronizando...
          </div>
        ) : (
          <div className="w-full">
            {/* ================= CONTEÚDO DA ABA: ESTOQUE ================= */}
            {abaAtiva === "estoque" && (
              <table className="w-full text-left border-collapse block lg:table">
                <thead className="hidden lg:table-header-group">
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold block lg:table-row">
                    <th className="px-4 py-3 block lg:table-cell">
                      Patrimônio
                    </th>
                    <th className="px-4 py-3 block lg:table-cell">Descrição</th>
                    <th className="px-4 py-3 text-center block lg:table-cell">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center block lg:table-cell">
                      Disponível
                    </th>
                    <th className="px-4 py-3 block lg:table-cell">Status</th>
                    <th className="px-4 py-3 text-right block lg:table-cell">
                      Opções
                    </th>
                  </tr>
                </thead>
                <tbody className="grid grid-cols-1 md:grid-cols-2 lg:table-row-group lg:divide-y divide-slate-200 text-sm text-slate-700 gap-4 lg:gap-0 relative">
                  {ferramentas.map((ferramenta) => (
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
                      <td className="px-4 py-3 lg:py-2 flex justify-between items-center lg:table-cell font-bold text-slate-900 border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden text-xs font-bold uppercase text-slate-400">
                          Descrição
                        </span>
                        {ferramenta.nome}
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
                      <td className="px-4 py-3 lg:py-2 flex justify-end lg:table-cell text-right relative">
                        <button
                          onClick={() =>
                            setMenuAbertoId(
                              menuAbertoId === ferramenta.id
                                ? null
                                : ferramenta.id,
                            )
                          }
                          className="flex items-center gap-2 p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg w-full lg:w-auto justify-center transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 hidden lg:block" />
                          <span className="lg:hidden font-semibold text-sm">
                            Gerenciar
                          </span>
                        </button>
                        {menuAbertoId === ferramenta.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden text-left animate-in fade-in zoom-in-95">
                            <button
                              disabled={ferramenta.qtdDisponivel <= 0}
                              onClick={() => {
                                setFerramentaSelecionada(ferramenta);
                                setModalEmprestimoAberto(true);
                                setMenuAbertoId(null);
                              }}
                              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 text-blue-700 font-semibold border-b border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowRightLeft className="w-4 h-4" /> Emprestar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* ESTE CÓDIGO INVISÍVEL FECHA O MENU SE CLICAR FORA DELE */}
                {menuAbertoId && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuAbertoId(null)}
                  ></div>
                )}
              </table>
            )}

            {/* ================= CONTEÚDO DA ABA: EMPRÉSTIMOS E HISTÓRICO ================= */}
            {abaAtiva === "emprestimos" && (
              <table className="w-full text-left border-collapse block lg:table">
                <thead className="hidden lg:table-header-group">
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold block lg:table-row">
                    <th className="px-4 py-3 block lg:table-cell">
                      Funcionário
                    </th>
                    <th className="px-4 py-3 block lg:table-cell">
                      Ferramenta
                    </th>
                    <th className="px-4 py-3 block lg:table-cell">Saída</th>
                    <th className="px-4 py-3 block lg:table-cell">Status</th>
                    <th className="px-4 py-3 text-right block lg:table-cell">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="grid grid-cols-1 md:grid-cols-2 lg:table-row-group lg:divide-y divide-slate-200 text-sm text-slate-700 gap-4 lg:gap-0 relative">
                  {emprestimos.length === 0 && (
                    <tr className="block lg:table-row">
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-500 block lg:table-cell"
                      >
                        Nenhum registro de empréstimo encontrado.
                      </td>
                    </tr>
                  )}

                  {emprestimos.map((emp) => (
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
      {/* O ERRO DO TAMANHO DAS CAIXAS FOI CORRIGIDO AQUI (w-full sm:flex-1) */}
      {modalCadastroAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                Cadastrar Ferramenta
              </h2>
              <button
                onClick={() => setModalCadastroAberto(false)}
                className="text-slate-400 hover:bg-slate-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCriarFerramenta} className="p-6 space-y-4">
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

              {/* Correção do Alinhamento Mobile! */}
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
          </div>
        </div>
      )}

      {/* ================= MODAL: EMPRESTAR FERRAMENTA ================= */}
      {modalEmprestimoAberto && ferramentaSelecionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-600 text-white">
              <h2 className="text-lg font-bold">Registrar Empréstimo</h2>
              <button
                onClick={() => setModalEmprestimoAberto(false)}
                className="text-white/70 hover:text-white hover:bg-blue-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmprestar} className="p-6 space-y-5">
              {/* Resumo da Ferramenta Escolhida */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-semibold uppercase">
                  Ferramenta Solicitada
                </p>
                <p className="font-bold text-slate-800 text-lg">
                  {ferramentaSelecionada.nome}
                </p>
                <p className="text-sm text-slate-600">
                  Patrimônio: {ferramentaSelecionada.codigoPatrimonio || "S/N"}
                </p>
              </div>

              {/* Seleção de Funcionário e Quantidade */}
              {/* CORREÇÃO AQUI: flex-col para empilhar no celular pequeno, sm:flex-row no computador */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* w-full no celular, flex-1 no computador */}
                <div className="w-full sm:flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Para qual funcionário?
                  </label>
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
                        {u.nome} (Setor:{" "}
                        {u.setores && u.setores.length > 0
                          ? u.setores.map((s) => s.nome).join(", ")
                          : "Geral"}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                {/* NOVO CAMPO: Quantidade de Saída (w-full no celular, w-24 no PC) */}
                <div className="w-full sm:w-24">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Qtd.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={ferramentaSelecionada.qtdDisponivel}
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
          </div>
        </div>
      )}
    </div>
  );
}
