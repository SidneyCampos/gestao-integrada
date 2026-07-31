/**
 * @file BensPermanentes.jsx
 * @description Módulo de controle de Bens Permanentes (Patrimônio Físico).
 * Formulário redesenhado em card único, steps visuais e campos condicionais.
 * @module Frontend/Pages/Almoxarifado/BensPermanentes
 */

import React, { useState, useEffect } from 'react';
import {
    Archive, ArrowLeft, Plus, Trash2, Edit3,
    ChevronDown, Loader2, AlertCircle, Building2,
    Calendar, CheckCircle2, Hash, Save, DollarSign,
    Heart, ShoppingCart, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Modal from '../../components/Modal';
import SetorSelectComCriacao from '../../components/SetorSelectComCriacao';
import useTabelaOrdenavel from '../../hooks/useTabelaOrdenavel';
import HeaderOrdenavel from '../../components/HeaderOrdenavel';

const STATUS_STYLE = {
    ATIVO:      { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ativo' },
    INATIVO:    { bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'Inativo' },
    MANUTENÇÃO: { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Manutenção' },
    BAIXADO:    { bg: 'bg-red-100',     text: 'text-red-600',     label: 'Baixado' },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLE[status] || STATUS_STYLE['ATIVO'];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    );
}

const FORM_INICIAL = {
    numeroPatrimonio: '',
    descricao: '',
    setorId: '',
    status: 'ATIVO',
    origem: 'ADQUIRIDO',
    doador: '',
    valorBem: '',
    dataEntrada: new Date().toISOString().split('T')[0],
};

// Input com label e ícone — componente interno reutilizável
function Campo({ label, required, children }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {label}{required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}

export default function BensPermanentes({ usuarioLogado }) {
    const navigate = useNavigate();
    const [bens, setBens] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoSetores, setCarregandoSetores] = useState(true);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroSetor, setFiltroSetor] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [erroForm, setErroForm] = useState('');

    useEffect(() => { buscarBens(); buscarSetores(); }, []);

    const buscarBens = async () => {
        try { setCarregando(true); const r = await api.get('/almoxarifado/bens-permanentes'); setBens(r.data); }
        catch (e) { console.error(e); } finally { setCarregando(false); }
    };
    const buscarSetores = async () => {
        try { setCarregandoSetores(true); const r = await api.get('/core/setores'); setSetores(r.data); }
        catch (e) { console.error(e); } finally { setCarregandoSetores(false); }
    };
    const handleSetorCriado = (s) => setSetores(p => [...p, s].sort((a, b) => a.nome.localeCompare(b.nome)));

    const handleAbrirModal = () => { setEditandoId(null); setForm(FORM_INICIAL); setErroForm(''); setModalAberto(true); };
    const handleAbrirEdicao = (e, bem) => {
        e.stopPropagation();
        setEditandoId(bem.id);
        setForm({
            numeroPatrimonio: bem.numeroPatrimonio,
            descricao: bem.descricao,
            setorId: String(bem.setor?.id || bem.setorId || ''),
            status: bem.status,
            origem: bem.origem || 'ADQUIRIDO',
            doador: bem.doador || '',
            valorBem: bem.valorBem != null ? String(bem.valorBem) : '',
            dataEntrada: bem.dataEntrada ? new Date(bem.dataEntrada).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setErroForm(''); setModalAberto(true);
    };
    const handleFecharModal = () => { setModalAberto(false); setErroForm(''); setEditandoId(null); };
    const handleFormChange = (campo, valor) => { setForm(p => ({ ...p, [campo]: valor })); if (erroForm) setErroForm(''); };

    const handleSalvar = async () => {
        if (!form.numeroPatrimonio.trim()) return setErroForm('Informe o número do patrimônio.');
        if (!form.descricao.trim()) return setErroForm('Informe a descrição do bem.');
        if (!form.setorId) return setErroForm('Selecione o setor de destino.');
        try {
            setSalvando(true);
            const payload = { ...form, setorId: parseInt(form.setorId), usuarioRegistroId: usuarioLogado.id };
            if (editandoId) await api.put(`/almoxarifado/bens-permanentes/${editandoId}`, payload);
            else await api.post('/almoxarifado/bens-permanentes', payload);
            setModalAberto(false); setEditandoId(null); buscarBens();
        } catch (e) { setErroForm(e.response?.data?.erro || 'Erro ao salvar.'); }
        finally { setSalvando(false); }
    };

    const handleDeletar = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Excluir este bem permanente? Esta ação não pode ser desfeita.')) return;
        try { await api.delete(`/almoxarifado/bens-permanentes/${id}`); buscarBens(); }
        catch (e) { alert(e.response?.data?.erro || 'Erro ao excluir.'); }
    };

    const bensFiltrados = bens.filter(b => {
        const t = filtroTexto.toLowerCase();
        return (!t || b.numeroPatrimonio.toLowerCase().includes(t) || b.descricao.toLowerCase().includes(t))
            && (!filtroSetor  || String(b.setor?.id) === filtroSetor)
            && (!filtroStatus || b.status === filtroStatus);
    });

    const { dadosOrdenados: bensExibidos, sortConfig, alternarOrdenacao } = useTabelaOrdenavel(bensFiltrados);

    const modoEdicao = editandoId !== null;
    const ehDoacao   = form.origem === 'DOACAO';

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <button onClick={() => navigate('/almoxarifado')} className="flex items-center gap-2 text-slate-400 hover:text-violet-600 transition-colors mb-2 text-xs font-bold uppercase tracking-wider">
                        <ArrowLeft className="w-3 h-3" /> Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-100"><Archive className="w-6 h-6 text-white" /></div>
                        Bens Permanentes
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-1">Patrimônio físico cadastrado e alocado por setor.</p>
                </div>
                <button onClick={handleAbrirModal} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-violet-100 transition-all active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Novo Bem
                </button>
            </div>

            {/* FILTROS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Patrimônio ou descrição..." value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-100" />
                </div>
                <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filtroSetor} onChange={e => setFiltroSetor(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                        <option value="">Todos os Setores</option>
                        {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                        <option value="">Todos os Status</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                        <option value="MANUTENÇÃO">Manutenção</option>
                        <option value="BAIXADO">Baixado</option>
                    </select>
                </div>
            </div>

            {!carregando && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 pl-1">{bensFiltrados.length} bem{bensFiltrados.length !== 1 ? 's' : ''} encontrado{bensFiltrados.length !== 1 ? 's' : ''}</p>}

            {/* LISTAGEM */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {carregando ? (
                    <div className="p-20 flex items-center justify-center gap-3 text-slate-400 text-sm animate-pulse"><Loader2 className="w-5 h-5 animate-spin" /> Carregando patrimônio...</div>
                ) : bensFiltrados.length === 0 ? (
                    <div className="p-20 text-center">
                        <Archive className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 italic text-sm">Nenhum bem encontrado.</p>
                        <button onClick={handleAbrirModal} className="mt-4 text-violet-600 font-bold text-xs hover:underline">+ Cadastrar o primeiro bem</button>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP */}
                        <table className="w-full text-left border-collapse hidden lg:table">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                                    <HeaderOrdenavel campo="numeroPatrimonio" label="Nº Patrimônio" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel campo="descricao" label="Descrição" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel campo="setor.nome" label="Setor" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel campo="dataEntrada" label="Entrada" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel campo="valorBem" label="Valor" align="right" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel campo="origem" label="Origem" align="center" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel campo="status" label="Status" align="center" sortConfig={sortConfig} onSort={alternarOrdenacao} />
                                    <HeaderOrdenavel label="Ações" align="right" desabilitado />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bensExibidos.map(bem => (
                                    <tr key={bem.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs font-black text-violet-700">{bem.numeroPatrimonio}</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-slate-800 max-w-[220px]">
                                            <p className="truncate">{bem.descricao}</p>
                                            {bem.doador && <p className="text-[10px] text-pink-600 font-bold mt-0.5 truncate">Doado por: {bem.doador}</p>}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-bold text-slate-600">
                                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-slate-400 shrink-0" />{bem.setor?.nome || '—'}</span>
                                        </td>
                                        <td className="px-5 py-3 text-xs font-mono text-slate-500">{new Date(bem.dataEntrada).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-5 py-3 text-right text-xs font-bold text-slate-700">
                                            {bem.valorBem != null ? bem.valorBem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {bem.origem === 'DOACAO'
                                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-700"><Heart className="w-2.5 h-2.5" />Doação</span>
                                                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700"><ShoppingCart className="w-2.5 h-2.5" />Adquirido</span>
                                            }
                                        </td>
                                        <td className="px-5 py-3 text-center"><StatusBadge status={bem.status} /></td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={(e) => handleAbrirEdicao(e, bem)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Editar"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={(e) => handleDeletar(e, bem.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* MOBILE CARDS */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {bensExibidos.map(bem => (
                                <div key={bem.id} className="p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-mono text-xs font-black text-violet-700">{bem.numeroPatrimonio}</span>
                                            {bem.doador && <p className="text-[10px] text-pink-600 font-bold mt-0.5">Doado por: {bem.doador}</p>}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {bem.origem === 'DOACAO' && <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pink-100 text-pink-700">Doação</span>}
                                            <StatusBadge status={bem.status} />
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{bem.descricao}</p>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" />{bem.setor?.nome || '—'}</span>
                                            {bem.valorBem != null && <span className="text-[10px] font-bold text-emerald-600">{bem.valorBem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => handleAbrirEdicao(e, bem)} className="text-slate-400 hover:text-violet-600"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={(e) => handleDeletar(e, bem.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── MODAL: NOVO / EDITAR BEM ── */}
            <Modal isOpen={modalAberto} onClose={handleFecharModal} title={modoEdicao ? 'Editar Bem Permanente' : 'Novo Bem Permanente'} variant="blue" width="max-w-xl">
                <div className="flex flex-col gap-4">

                    {/* Banner de edição */}
                    {modoEdicao && (
                        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl p-3">
                            <Edit3 className="w-4 h-4 text-violet-500 shrink-0" />
                            <p className="text-xs text-violet-700 font-medium">Modo de edição — altere os campos necessários e salve.</p>
                        </div>
                    )}

                    {erroForm && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-xs text-red-700 font-medium">{erroForm}</p>
                        </div>
                    )}

                    {/* ── SEÇÃO 1: IDENTIFICAÇÃO ── */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Campo label="Nº Patrimônio" required>
                                <div className="relative">
                                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Ex: 00145-PM-2024" value={form.numeroPatrimonio} onChange={e => handleFormChange('numeroPatrimonio', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors" />
                                </div>
                            </Campo>
                            <Campo label="Data de Entrada">
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input type="date" value={form.dataEntrada} onChange={e => handleFormChange('dataEntrada', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors" />
                                </div>
                            </Campo>
                        </div>
                        <Campo label="Descrição do Bem" required>
                            <input type="text" placeholder="Ex: Computador Dell Optiplex 3080 i5" value={form.descricao} onChange={e => handleFormChange('descricao', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors" />
                        </Campo>
                    </div>

                    {/* ── SEÇÃO 2: ALOCAÇÃO ── */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alocação</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <Campo label="Setor de Destino" required>
                                    <SetorSelectComCriacao value={form.setorId} onChange={({ setorId }) => handleFormChange('setorId', setorId)} setores={setores} onSetorCriado={handleSetorCriado} carregando={carregandoSetores} />
                                </Campo>
                            </div>
                            <Campo label="Status">
                                <div className="relative">
                                    <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <select value={form.status} onChange={e => handleFormChange('status', e.target.value)}
                                        className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors">
                                        <option value="ATIVO">Ativo</option>
                                        <option value="INATIVO">Inativo</option>
                                        <option value="MANUTENÇÃO">Manutenção</option>
                                        <option value="BAIXADO">Baixado</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </Campo>
                            <Campo label="Valor do Bem (R$)">
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input type="number" step="0.01" min="0" placeholder="0,00" value={form.valorBem} onChange={e => handleFormChange('valorBem', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors" />
                                </div>
                            </Campo>
                        </div>
                    </div>

                    {/* ── SEÇÃO 3: ORIGEM ── */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem do Bem</p>

                        {/* Seletor de origem como toggle */}
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => handleFormChange('origem', 'ADQUIRIDO')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${form.origem === 'ADQUIRIDO' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                <ShoppingCart className="w-4 h-4" /> Prefeitura
                            </button>
                            <button type="button" onClick={() => handleFormChange('origem', 'DOACAO')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${form.origem === 'DOACAO' ? 'border-pink-400 bg-pink-50 text-pink-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                <Heart className="w-4 h-4" /> Doação
                            </button>
                        </div>

                        {/* Campo condicional: quem doou — só aparece se DOACAO */}
                        {ehDoacao && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <Campo label="Quem doou?">
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" />
                                        <input type="text" placeholder="Nome do doador, empresa, instituição..." value={form.doador} onChange={e => handleFormChange('doador', e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-pink-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-400 transition-colors placeholder:text-slate-400 placeholder:font-normal" />
                                    </div>
                                </Campo>
                            </div>
                        )}
                    </div>

                    {/* RODAPÉ */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={handleFecharModal} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                        <button onClick={handleSalvar} disabled={salvando || !form.numeroPatrimonio || !form.descricao || !form.setorId}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-7 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                            {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : modoEdicao ? <><Save className="w-4 h-4" /> Salvar Alterações</> : <><Archive className="w-4 h-4" /> Cadastrar Bem</>}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
