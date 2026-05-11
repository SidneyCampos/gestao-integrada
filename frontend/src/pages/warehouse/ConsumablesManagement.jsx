/**
 * @file Consumo.jsx
 * @description Módulo de Materiais de Consumo com expansão de detalhes, layout mobile otimizado e Catálogo de Estoque.
 * @module Frontend/Pages/Almoxarifado/Consumo
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShoppingBag, 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Search, 
    Calendar, 
    Building2, 
    DollarSign,
    ChevronDown,
    History,
    Edit3,
    ChevronUp,
    Info,
    AlertCircle,
    PackageSearch,
    Tags
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Modal from '../../components/Modal';

export default function ConsumablesManagement({ usuarioLogado }) {
    const navigate = useNavigate();
    
    // Abas
    const [abaAtual, setAbaAtual] = useState('requisicoes'); // 'requisicoes' | 'catalogo'

    // Estados da Lista de Requisições
    const [requisicoes, setRequisicoes] = useState([]);
    const [setores, setSetores] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    
    // Filtros
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroMes, setFiltroMes] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState(""); // Filtro do catálogo
    
    const [expandidoId, setExpandidoId] = useState(null);

    // Estados do Modal de Requisição
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    
    const [novaRequisicao, setNovaRequisicao] = useState({
        departamentoDestino: "",
        mesReferencia: "",
        itens: [{ id: Date.now(), produtoId: "", descricaoProduto: "", quantidade: 1, valorUnitario: 0 }]
    });

    // Estados do Modal de Produto (Catálogo)
    const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
    const [salvandoProduto, setSalvandoProduto] = useState(false);
    const [editandoProdutoId, setEditandoProdutoId] = useState(null);
    const [novoProduto, setNovoProduto] = useState({
        nome: "", categoria: "Geral", quantidadeEstoque: 0, valorUnitarioAtual: 0
    });

    const mesesDisponiveis = useMemo(() => {
        const lista = [];
        const dataReferencia = new Date();
        for (let i = -6; i <= 6; i++) {
            const d = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + i, 1);
            const mes = d.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
            const ano = d.getFullYear();
            lista.push(`${mes}/${ano}`);
        }
        return lista;
    }, []);

    useEffect(() => {
        const mesAtual = `${new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}/${new Date().getFullYear()}`;
        setNovaRequisicao(prev => ({ ...prev, mesReferencia: mesAtual }));
        buscarDadosIniciais();
    }, []);

    const buscarDadosIniciais = async () => {
        setCarregando(true);
        await Promise.all([buscarRequisicoes(), buscarSetores(), buscarProdutos()]);
        setCarregando(false);
    };

    const buscarRequisicoes = async () => {
        try {
            const res = await api.get('/almoxarifado/consumo');
            setRequisicoes(res.data);
        } catch (erro) {
            console.error("Erro ao buscar consumos:", erro);
        }
    };

    const buscarSetores = async () => {
        try {
            const res = await api.get('/core/setores');
            setSetores(res.data);
        } catch (erro) {
            console.error("Erro ao buscar setores:", erro);
        }
    };

    const buscarProdutos = async () => {
        try {
            const res = await api.get('/almoxarifado/produtos-consumo');
            setProdutos(res.data);
        } catch (erro) {
            console.error("Erro ao buscar produtos:", erro);
        }
    };

    // --- AÇÕES REQUISIÇÃO ---

    const handleAbrirNovo = () => {
        setEditandoId(null);
        const mesAtual = `${new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}/${new Date().getFullYear()}`;
        setNovaRequisicao({
            departamentoDestino: "",
            mesReferencia: mesAtual, 
            itens: [{ id: Date.now(), produtoId: "", descricaoProduto: "", quantidade: 1, valorUnitario: 0 }]
        });
        setModalAberto(true);
    };

    const handleAbrirEdicao = (e, req) => {
        e.stopPropagation();
        setEditandoId(req.id);
        setNovaRequisicao({
            departamentoDestino: req.departamentoDestino,
            mesReferencia: req.mesReferencia,
            itens: req.itens.map(it => ({ ...it, id: it.id || Math.random() }))
        });
        setModalAberto(true);
    };

    const handleDeletar = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Deseja realmente excluir este lançamento e estornar o estoque?")) return;
        try {
            await api.delete(`/almoxarifado/consumo/${id}`);
            await buscarDadosIniciais();
        } catch (erro) {
            alert("Erro ao excluir lançamento.");
        }
    };

    const handleSalvar = async () => {
        if (!novaRequisicao.departamentoDestino) return alert("Escolha o departamento.");
        if (novaRequisicao.itens.some(i => !i.descricaoProduto && !i.produtoId)) return alert("Selecione os produtos.");

        try {
            setSalvando(true);
            const payload = { ...novaRequisicao, usuarioId: usuarioLogado.id };
            if (editandoId) {
                await api.put(`/almoxarifado/consumo/${editandoId}`, payload);
            } else {
                await api.post('/almoxarifado/consumo', payload);
            }
            setModalAberto(false);
            await buscarDadosIniciais();
        } catch (erro) {
            alert(erro.response?.data?.erro || "Erro ao salvar.");
        } finally {
            setSalvando(false);
        }
    };

    // --- AÇÕES CATÁLOGO ---

    const handleAbrirNovoProduto = () => {
        setEditandoProdutoId(null);
        setNovoProduto({ nome: "", categoria: "Geral", quantidadeEstoque: 0, valorUnitarioAtual: 0 });
        setModalProdutoAberto(true);
    };

    const handleAbrirEdicaoProduto = (prod) => {
        setEditandoProdutoId(prod.id);
        setNovoProduto({ 
            nome: prod.nome, 
            categoria: prod.categoria, 
            quantidadeEstoque: prod.quantidadeEstoque, 
            valorUnitarioAtual: prod.valorUnitarioAtual 
        });
        setModalProdutoAberto(true);
    };

    const handleSalvarProduto = async () => {
        if (!novoProduto.nome) return alert("Preencha o nome do produto.");
        try {
            setSalvandoProduto(true);
            if (editandoProdutoId) {
                await api.put(`/almoxarifado/produtos-consumo/${editandoProdutoId}`, novoProduto);
            } else {
                await api.post('/almoxarifado/produtos-consumo', novoProduto);
            }
            setModalProdutoAberto(false);
            await buscarProdutos();
        } catch (erro) {
            alert("Erro ao salvar produto.");
        } finally {
            setSalvandoProduto(false);
        }
    };

    const handleDeletarProduto = async (id) => {
        if (!window.confirm("Deseja realmente excluir este produto do catálogo?")) return;
        try {
            await api.delete(`/almoxarifado/produtos-consumo/${id}`);
            await buscarProdutos();
        } catch (erro) {
            alert(erro.response?.data?.erro || "Erro ao excluir produto. Ele já pode estar vinculado a requisições.");
        }
    };

    // --- HELPERS REQUISIÇÃO ---

    const toggleExpandir = (id) => setExpandidoId(expandidoId === id ? null : id);
    const addLinha = () => setNovaRequisicao(p => ({ ...p, itens: [...p.itens, { id: Date.now(), produtoId: "", descricaoProduto: "", quantidade: 1, valorUnitario: 0 }] }));
    const removerLinha = (id) => novaRequisicao.itens.length > 1 && setNovaRequisicao(p => ({ ...p, itens: p.itens.filter(i => i.id !== id) }));
    
    const updateItemProduto = (id, produtoIdStr) => {
        if (!produtoIdStr) {
            setNovaRequisicao(p => ({ ...p, itens: p.itens.map(i => i.id === id ? { ...i, produtoId: "", descricaoProduto: "", valorUnitario: 0 } : i) }));
            return;
        }
        const produto = produtos.find(p => p.id === parseInt(produtoIdStr));
        if (produto) {
            setNovaRequisicao(p => ({
                ...p, 
                itens: p.itens.map(i => i.id === id ? { 
                    ...i, 
                    produtoId: produto.id, 
                    descricaoProduto: produto.nome, 
                    valorUnitario: produto.valorUnitarioAtual 
                } : i)
            }));
        }
    };

    const updateItem = (id, campo, valor) => setNovaRequisicao(p => ({ ...p, itens: p.itens.map(i => i.id === id ? { ...i, [campo]: valor } : i) }));
    
    const custoTotalModal = useMemo(() => novaRequisicao.itens.reduce((acc, i) => acc + (parseFloat(i.quantidade || 0) * parseFloat(i.valorUnitario || 0)), 0), [novaRequisicao.itens]);

    const requisicoesFiltradas = requisicoes.filter(r => r.departamentoDestino.toLowerCase().includes(filtroDepto.toLowerCase()) && (filtroMes === "" || r.mesReferencia === filtroMes));
    const produtosFiltrados = produtos.filter(p => filtroCategoria === "" || p.categoria === filtroCategoria);

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <button onClick={() => navigate('/almoxarifado')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-2 text-xs font-bold uppercase tracking-wider">
                        <ArrowLeft className="w-3 h-3" /> Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <div className="bg-cyan-600 p-2.5 rounded-2xl shadow-lg shadow-cyan-100">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        Consumo & Estoque
                    </h1>
                </div>

                <button 
                    onClick={abaAtual === 'requisicoes' ? handleAbrirNovo : handleAbrirNovoProduto} 
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                    {abaAtual === 'requisicoes' ? "Nova Requisição" : "Novo Produto"}
                </button>
            </div>

            {/* TABS */}
            <div className="flex space-x-2 mb-6 bg-slate-100 p-1 rounded-2xl w-full sm:w-fit">
                <button 
                    onClick={() => setAbaAtual('requisicoes')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${abaAtual === 'requisicoes' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Requisições
                </button>
                <button 
                    onClick={() => setAbaAtual('catalogo')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${abaAtual === 'catalogo' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Catálogo de Estoque
                </button>
            </div>

            {/* CONTEÚDO REQUISIÇÕES */}
            {abaAtual === 'requisicoes' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative">
                            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Filtrar Departamento..." value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div className="relative">
                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                                <option value="">Todos os Meses</option>
                                {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {carregando ? (
                            <div className="p-20 text-center text-slate-400 animate-pulse font-medium text-sm">Carregando...</div>
                        ) : requisicoesFiltradas.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 italic text-sm">Nenhum registro encontrado.</div>
                        ) : (
                            <table className="w-full text-left border-collapse block lg:table">
                                <thead className="hidden lg:table-header-group">
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black tracking-widest block lg:table-row">
                                        <th className="px-6 py-4 w-10"></th>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Departamento</th>
                                        <th className="px-6 py-4">Mês Ref.</th>
                                        <th className="px-6 py-4">Itens</th>
                                        <th className="px-6 py-4 text-right">Valor Total</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 block lg:table-row-group">
                                    {requisicoesFiltradas.map(req => {
                                        const isExpandido = expandidoId === req.id;
                                        return (
                                            <React.Fragment key={req.id}>
                                                <tr onClick={() => toggleExpandir(req.id)} className={`cursor-pointer transition-all block lg:table-row hover:bg-slate-50 ${isExpandido ? "bg-cyan-50/40" : ""}`}>
                                                    <td className="lg:hidden p-4 block">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold text-sm text-slate-800">{req.departamentoDestino}</span>
                                                            <span className="font-black text-slate-900">{req.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                        </div>
                                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                                            <span>{req.mesReferencia}</span>
                                                            <span>{req.itens.length} itens</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 hidden lg:table-cell text-center">
                                                        {isExpandido ? <ChevronUp className="w-4 h-4 text-cyan-600 mx-auto" /> : <ChevronDown className="w-4 h-4 text-slate-300 mx-auto" />}
                                                    </td>
                                                    <td className="px-6 py-3 hidden lg:table-cell text-xs font-mono text-slate-500">{new Date(req.dataRegistro).toLocaleDateString()}</td>
                                                    <td className="px-6 py-3 hidden lg:table-cell font-bold text-slate-800 uppercase text-xs">{req.departamentoDestino}</td>
                                                    <td className="px-6 py-3 hidden lg:table-cell"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black">{req.mesReferencia}</span></td>
                                                    <td className="px-6 py-3 hidden lg:table-cell text-xs font-semibold text-slate-500">{req.itens.length} materiais</td>
                                                    <td className="px-6 py-3 hidden lg:table-cell text-right font-black text-slate-900">{req.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                    <td className="px-6 py-3 hidden lg:table-cell text-right space-x-2">
                                                        <button onClick={(e) => handleAbrirEdicao(e, req)} className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                                                        <button onClick={(e) => handleDeletar(e, req.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                                {isExpandido && (
                                                    <tr className="block lg:table-row bg-cyan-50/30 border-b border-cyan-100/50">
                                                        <td colSpan="7" className="p-4 lg:px-8 lg:py-6 block lg:table-cell">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {req.itens.map((it, idx) => (
                                                                    <div key={idx} className="bg-white p-3 rounded-xl border border-cyan-100 shadow-sm flex items-center justify-between">
                                                                        <div className="flex-1">
                                                                            <p className="text-xs font-bold text-slate-800">{it.descricaoProduto}</p>
                                                                            {it.produto && <p className="text-[10px] text-cyan-600 font-bold uppercase">{it.produto.categoria}</p>}
                                                                        </div>
                                                                        <div className="text-right ml-4">
                                                                            <p className="text-xs font-black text-cyan-600 whitespace-nowrap">{it.quantidade}x {it.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* CONTEÚDO CATÁLOGO */}
            {abaAtual === 'catalogo' && (
                <>
                    <div className="flex space-x-2 mb-6">
                        <button onClick={() => setFiltroCategoria('')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroCategoria === '' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todas</button>
                        <button onClick={() => setFiltroCategoria('Geral')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroCategoria === 'Geral' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Geral</button>
                        <button onClick={() => setFiltroCategoria('Elétrica')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroCategoria === 'Elétrica' ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Elétrica</button>
                        <button onClick={() => setFiltroCategoria('TI')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroCategoria === 'TI' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>TI</button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black">
                                <tr>
                                    <th className="px-6 py-4">Produto</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4 text-center">Estoque</th>
                                    <th className="px-6 py-4 text-right">Preço Base</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {produtosFiltrados.map(prod => (
                                    <tr key={prod.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-sm text-slate-800">{prod.nome}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                                                ${prod.categoria === 'Geral' ? 'bg-blue-100 text-blue-700' : 
                                                  prod.categoria === 'Elétrica' ? 'bg-yellow-100 text-yellow-700' : 
                                                  'bg-purple-100 text-purple-700'}`}>
                                                {prod.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black text-sm ${prod.quantidadeEstoque <= 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                                {prod.quantidadeEstoque}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-500">
                                            {prod.valorUnitarioAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleAbrirEdicaoProduto(prod)} className="p-1.5 text-slate-400 hover:text-cyan-600 bg-slate-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeletarProduto(prod.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* MODAL REQUISIÇÃO */}
            <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={editandoId ? "Editar Requisição" : "Nova Requisição"} variant="cyan" width="max-w-4xl">
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Departamento</label>
                            <select value={novaRequisicao.departamentoDestino} onChange={(e) => setNovaRequisicao(p => ({ ...p, departamentoDestino: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm">
                                <option value="">Selecione...</option>
                                {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Mês Ref.</label>
                            <select value={novaRequisicao.mesReferencia} onChange={(e) => setNovaRequisicao(p => ({ ...p, mesReferencia: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm">
                                {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materiais (Catálogo)</label>
                            <button onClick={addLinha} className="text-cyan-600 hover:text-cyan-700 text-xs font-black flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {novaRequisicao.itens.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center">
                                    <select 
                                        value={item.produtoId || ""}
                                        onChange={(e) => updateItemProduto(item.id, e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none"
                                    >
                                        <option value="">Selecione um Produto...</option>
                                        {produtos.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.quantidadeEstoque <= 0}>
                                                {p.nome} ({p.categoria}) - {p.quantidadeEstoque} disp.
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Caso precise digitar um item off-catalogo (opcional) */}
                                    {!item.produtoId && (
                                        <input type="text" placeholder="Ou digite o nome..." value={item.descricaoProduto} onChange={(e) => updateItem(item.id, 'descricaoProduto', e.target.value)} className="w-40 bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold" />
                                    )}

                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <input type="number" placeholder="Qtd" value={item.quantidade} onChange={(e) => updateItem(item.id, 'quantidade', e.target.value)} className="w-16 bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold" />
                                        <div className="w-24 relative">
                                            <DollarSign className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input type="number" placeholder="Unit." value={item.valorUnitario} onChange={(e) => updateItem(item.id, 'valorUnitario', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 pl-5 text-xs font-bold" />
                                        </div>
                                        <button onClick={() => removerLinha(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                        <button onClick={handleSalvar} disabled={salvando} className="bg-cyan-600 text-white px-6 py-2 rounded-xl font-black text-sm transition-all active:scale-95">
                            {salvando ? "Salvando..." : "Salvar Requisição"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* MODAL PRODUTO CATÁLOGO */}
            <Modal isOpen={modalProdutoAberto} onClose={() => setModalProdutoAberto(false)} title={editandoProdutoId ? "Editar Produto" : "Novo Produto"} variant="blue">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase">Nome do Produto</label>
                        <input type="text" value={novoProduto.nome} onChange={(e) => setNovoProduto(p => ({...p, nome: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" placeholder="Ex: Fio de Cobre 2.5mm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase">Categoria</label>
                        <select value={novoProduto.categoria} onChange={(e) => setNovoProduto(p => ({...p, categoria: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm">
                            <option value="Geral">Geral</option>
                            <option value="Elétrica">Elétrica</option>
                            <option value="TI">TI</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase">Estoque Inicial</label>
                            <input type="number" value={novoProduto.quantidadeEstoque} onChange={(e) => setNovoProduto(p => ({...p, quantidadeEstoque: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase">Preço Base (R$)</label>
                            <input type="number" step="0.01" value={novoProduto.valorUnitarioAtual} onChange={(e) => setNovoProduto(p => ({...p, valorUnitarioAtual: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setModalProdutoAberto(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                        <button onClick={handleSalvarProduto} disabled={salvandoProduto} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-sm transition-all active:scale-95">
                            {salvandoProduto ? "Salvando..." : "Salvar Produto"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
