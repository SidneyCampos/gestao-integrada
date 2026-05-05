/**
 * @file Consumo.jsx
 * @description Módulo de Materiais de Consumo com expansão de detalhes e layout mobile otimizado.
 * @module Frontend/Pages/Almoxarifado/Consumo
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShoppingBag, 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    Search, 
    Calendar, 
    Building2, 
    DollarSign,
    ChevronDown,
    X,
    FileText,
    History,
    Edit3,
    ChevronUp,
    Info,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Modal from '../../components/Modal';

export default function ConsumablesManagement({ usuarioLogado }) {
    const navigate = useNavigate();
    
    // Estados da Lista
    const [requisicoes, setRequisicoes] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroMes, setFiltroMes] = useState("");
    const [expandidoId, setExpandidoId] = useState(null);

    // Estados do Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    
    const [novaRequisicao, setNovaRequisicao] = useState({
        departamentoDestino: "",
        mesReferencia: "",
        itens: [{ id: Date.now(), descricaoProduto: "", quantidade: 1, valorUnitario: 0 }]
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
        buscarDados();
        buscarSetores();
    }, []);

    const buscarDados = async () => {
        try {
            setCarregando(true);
            const res = await api.get('/almoxarifado/consumo');
            setRequisicoes(res.data);
        } catch (erro) {
            console.error("Erro ao buscar consumos:", erro);
        } finally {
            setCarregando(false);
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

    // --- AÇÕES ---

    const handleAbrirNovo = () => {
        setEditandoId(null);
        setNovaRequisicao({
            departamentoDestino: "",
            mesReferencia: mesesDisponiveis[6], 
            itens: [{ id: Date.now(), descricaoProduto: "", quantidade: 1, valorUnitario: 0 }]
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
        if (!window.confirm("Deseja realmente excluir este lançamento?")) return;
        try {
            await api.delete(`/almoxarifado/consumo/${id}`);
            buscarDados();
        } catch (erro) {
            alert("Erro ao excluir lançamento.");
        }
    };

    const handleSalvar = async () => {
        if (!novaRequisicao.departamentoDestino) return alert("Escolha o departamento.");
        if (novaRequisicao.itens.some(i => !i.descricaoProduto)) return alert("Preencha as descrições.");

        if (!editandoId) {
            const jaExiste = requisicoes.find(r => 
                r.departamentoDestino === novaRequisicao.departamentoDestino && 
                r.mesReferencia === novaRequisicao.mesReferencia
            );
            if (jaExiste) {
                return alert(`Já existe um registro para "${novaRequisicao.departamentoDestino}" em "${novaRequisicao.mesReferencia}".`);
            }
        }

        try {
            setSalvando(true);
            const payload = { ...novaRequisicao, usuarioId: usuarioLogado.id };
            if (editandoId) {
                await api.put(`/almoxarifado/consumo/${editandoId}`, payload);
            } else {
                await api.post('/almoxarifado/consumo', payload);
            }
            setModalAberto(false);
            buscarDados();
        } catch (erro) {
            alert(erro.response?.data?.erro || "Erro ao salvar.");
        } finally {
            setSalvando(false);
        }
    };

    const toggleExpandir = (id) => {
        setExpandidoId(expandidoId === id ? null : id);
    };

    const addLinha = () => setNovaRequisicao(p => ({ ...p, itens: [...p.itens, { id: Date.now(), descricaoProduto: "", quantidade: 1, valorUnitario: 0 }] }));
    const removerLinha = (id) => novaRequisicao.itens.length > 1 && setNovaRequisicao(p => ({ ...p, itens: p.itens.filter(i => i.id !== id) }));
    const updateItem = (id, campo, valor) => setNovaRequisicao(p => ({ ...p, itens: p.itens.map(i => i.id === id ? { ...i, [campo]: valor } : i) }));
    const custoTotalModal = useMemo(() => novaRequisicao.itens.reduce((acc, i) => acc + (parseFloat(i.quantidade || 0) * parseFloat(i.valorUnitario || 0)), 0), [novaRequisicao.itens]);

    const requisicoesFiltradas = requisicoes.filter(r => r.departamentoDestino.toLowerCase().includes(filtroDepto.toLowerCase()) && (filtroMes === "" || r.mesReferencia === filtroMes));

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
                        Consumo
                    </h1>
                </div>

                <button onClick={handleAbrirNovo} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Novo Lançamento
                </button>
            </div>

            {/* FILTROS */}
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

            {/* LISTAGEM */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {carregando ? (
                    <div className="p-20 text-center text-slate-400 animate-pulse font-medium text-sm">Carregando...</div>
                ) : requisicoesFiltradas.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 italic text-sm">Nenhum registro.</div>
                ) : (
                    <table className="w-full text-left border-collapse block lg:table">
                        <thead className="hidden lg:table-header-group">
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black tracking-widest block lg:table-row">
                                <th className="px-6 py-4 w-10"></th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Departamento Destino</th>
                                <th className="px-6 py-4">Mês Referência</th>
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
                                        <tr 
                                            onClick={() => toggleExpandir(req.id)} 
                                            className={`cursor-pointer transition-all block lg:table-row hover:bg-slate-50 ${isExpandido ? "bg-blue-50/40" : ""}`}
                                        >
                                            {/* MOBILE VIEW (CARD COMPACTO) */}
                                            <td className="lg:hidden p-4 block">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            {new Date(req.dataRegistro).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tighter">
                                                            {req.mesReferencia}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <span className="font-bold text-slate-800 uppercase text-xs leading-tight flex-1">
                                                            {req.departamentoDestino}
                                                        </span>
                                                        <span className="font-black text-slate-900 text-sm whitespace-nowrap">
                                                            {req.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50">
                                                        <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                                                            <Info className="w-3 h-3" /> {req.itens.length} materiais
                                                        </span>
                                                        <div className="flex gap-4">
                                                            <button onClick={(e) => handleAbrirEdicao(e, req)} className="text-slate-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                                                            <button onClick={(e) => handleDeletar(e, req.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                            {isExpandido ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* DESKTOP VIEW */}
                                            <td className="px-6 py-3 hidden lg:table-cell text-center">
                                                {isExpandido ? <ChevronUp className="w-4 h-4 text-blue-600 mx-auto" /> : <ChevronDown className="w-4 h-4 text-slate-300 mx-auto" />}
                                            </td>
                                            <td className="px-6 py-3 hidden lg:table-cell text-xs font-mono text-slate-500">
                                                {new Date(req.dataRegistro).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 hidden lg:table-cell font-bold text-slate-800 uppercase text-xs">
                                                {req.departamentoDestino}
                                            </td>
                                            <td className="px-6 py-3 hidden lg:table-cell">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black">{req.mesReferencia}</span>
                                            </td>
                                            <td className="px-6 py-3 hidden lg:table-cell text-xs font-semibold text-slate-500">
                                                {req.itens.length} materiais
                                            </td>
                                            <td className="px-6 py-3 hidden lg:table-cell text-right font-black text-slate-900">
                                                {req.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-6 py-3 hidden lg:table-cell text-right space-x-2">
                                                <button onClick={(e) => handleAbrirEdicao(e, req)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={(e) => handleDeletar(e, req.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>

                                        {/* GAVETA DE DETALHES */}
                                        {isExpandido && (
                                            <tr className="block lg:table-row bg-blue-50/30 border-b border-blue-100/50 animate-in slide-in-from-top-1 duration-200">
                                                <td colSpan="7" className="p-4 lg:px-8 lg:py-6 block lg:table-cell">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {req.itens.map((it, idx) => (
                                                            <div key={idx} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Item</p>
                                                                    <p className="text-xs font-bold text-slate-800">{it.descricaoProduto}</p>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Subtotal</p>
                                                                    <p className="text-xs font-black text-blue-600 whitespace-nowrap">{it.quantidade}x {it.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-2 text-[9px] text-blue-400 font-bold uppercase tracking-widest">
                                                        <History className="w-3 h-3" /> Registrado por {req.usuario?.nome}
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

            {/* MODAL PLANILHA */}
            <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={editandoId ? "Editar Lançamento" : "Novo Lançamento"} variant="cyan" width="max-w-4xl">
                <div className="flex flex-col gap-6">
                    {!editandoId && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-700 font-medium leading-tight">
                                <strong>Atenção:</strong> Cada setor pode ter apenas 1 lançamento por mês. Se já existir, edite-o.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Departamento de Destino</label>
                            <div className="relative">
                                <select value={novaRequisicao.departamentoDestino} onChange={(e) => setNovaRequisicao(p => ({ ...p, departamentoDestino: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm appearance-none">
                                    <option value="">Selecione...</option>
                                    {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Mês de Referência</label>
                            <div className="relative">
                                <select value={novaRequisicao.mesReferencia} onChange={(e) => setNovaRequisicao(p => ({ ...p, mesReferencia: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm appearance-none">
                                    {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materiais</label>
                            <button onClick={addLinha} className="text-blue-600 hover:text-blue-700 text-xs font-black flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {novaRequisicao.itens.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center">
                                    <input type="text" placeholder="Descrição" value={item.descricaoProduto} onChange={(e) => updateItem(item.id, 'descricaoProduto', e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm font-bold" />
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

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase text-slate-400">Total</span>
                            <span className="text-base font-black tracking-tighter">{custoTotalModal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                            <button onClick={handleSalvar} disabled={salvando} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-95">
                                {salvando ? "Salvando..." : "Finalizar"}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
