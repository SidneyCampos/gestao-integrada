/**
 * @file BensPermanentes.jsx
 * @description Módulo de controle de Bens Permanentes (Patrimônio Físico).
 * Permite cadastrar, visualizar e gerenciar bens alocados por setor.
 * Segue o padrão Data-Dense UI: tabela compacta no desktop, cards empilhados no mobile.
 * @module Frontend/Pages/Almoxarifado/BensPermanentes
 */

import React, { useState, useEffect } from 'react';
import {
    Archive,
    ArrowLeft,
    Plus,
    Trash2,
    ChevronDown,
    Loader2,
    AlertCircle,
    Building2,
    Tag,
    Calendar,
    CheckCircle2,
    XCircle,
    Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Modal from '../../components/Modal';

// Mapa de cores por status para badge visual
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
    dataEntrada: new Date().toISOString().split('T')[0],
};

export default function BensPermanentes({ usuarioLogado }) {
    const navigate = useNavigate();

    // --- Dados ---
    const [bens, setBens] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoSetores, setCarregandoSetores] = useState(true);

    // --- Filtros ---
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroSetor, setFiltroSetor] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    // --- Modal ---
    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [erroForm, setErroForm] = useState('');

    useEffect(() => {
        buscarBens();
        buscarSetores();
    }, []);

    const buscarBens = async () => {
        try {
            setCarregando(true);
            const res = await api.get('/almoxarifado/bens-permanentes');
            setBens(res.data);
        } catch (erro) {
            console.error('[BENS] Erro ao buscar bens permanentes:', erro);
        } finally {
            setCarregando(false);
        }
    };

    const buscarSetores = async () => {
        try {
            setCarregandoSetores(true);
            const res = await api.get('/core/setores');
            setSetores(res.data);
        } catch (erro) {
            console.error('[BENS] Erro ao buscar setores:', erro);
        } finally {
            setCarregandoSetores(false);
        }
    };

    const handleAbrirModal = () => {
        setForm(FORM_INICIAL);
        setErroForm('');
        setModalAberto(true);
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setErroForm('');
    };

    const handleFormChange = (campo, valor) => {
        setForm(p => ({ ...p, [campo]: valor }));
        if (erroForm) setErroForm('');
    };

    const handleSalvar = async () => {
        // Validações obrigatórias
        if (!form.numeroPatrimonio.trim()) return setErroForm('Informe o número do patrimônio.');
        if (!form.descricao.trim()) return setErroForm('Informe a descrição do bem.');
        if (!form.setorId) return setErroForm('Selecione o setor de destino.');

        try {
            setSalvando(true);
            await api.post('/almoxarifado/bens-permanentes', {
                ...form,
                setorId: parseInt(form.setorId),
                usuarioRegistroId: usuarioLogado.id,
            });
            setModalAberto(false);
            buscarBens();
        } catch (erro) {
            setErroForm(erro.response?.data?.erro || 'Erro ao cadastrar bem permanente.');
        } finally {
            setSalvando(false);
        }
    };

    const handleDeletar = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Deseja realmente excluir este bem permanente? Esta ação não pode ser desfeita.')) return;
        try {
            await api.delete(`/almoxarifado/bens-permanentes/${id}`);
            buscarBens();
        } catch (erro) {
            alert(erro.response?.data?.erro || 'Erro ao excluir bem permanente.');
        }
    };

    // --- Filtragem local ---
    const bensFiltrados = bens.filter(b => {
        const texto = filtroTexto.toLowerCase();
        const matchTexto = !texto ||
            b.numeroPatrimonio.toLowerCase().includes(texto) ||
            b.descricao.toLowerCase().includes(texto);
        const matchSetor = !filtroSetor || String(b.setor?.id) === filtroSetor;
        const matchStatus = !filtroStatus || b.status === filtroStatus;
        return matchTexto && matchSetor && matchStatus;
    });

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/almoxarifado')}
                        className="flex items-center gap-2 text-slate-400 hover:text-violet-600 transition-colors mb-2 text-xs font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-3 h-3" /> Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-100">
                            <Archive className="w-6 h-6 text-white" />
                        </div>
                        Bens Permanentes
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-1">Patrimônio físico cadastrado e alocado por setor.</p>
                </div>

                <button
                    onClick={handleAbrirModal}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-violet-100 transition-all active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Novo Bem
                </button>
            </div>

            {/* ── FILTROS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                {/* Busca texto */}
                <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Patrimônio ou descrição..."
                        value={filtroTexto}
                        onChange={e => setFiltroTexto(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-100"
                    />
                </div>

                {/* Filtro setor */}
                <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filtroSetor}
                        onChange={e => setFiltroSetor(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"
                    >
                        <option value="">Todos os Setores</option>
                        {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                </div>

                {/* Filtro status */}
                <div className="relative">
                    <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        value={filtroStatus}
                        onChange={e => setFiltroStatus(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"
                    >
                        <option value="">Todos os Status</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                        <option value="MANUTENÇÃO">Manutenção</option>
                        <option value="BAIXADO">Baixado</option>
                    </select>
                </div>
            </div>

            {/* ── CONTADOR ── */}
            {!carregando && (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 pl-1">
                    {bensFiltrados.length} bem{bensFiltrados.length !== 1 ? 's' : ''} encontrado{bensFiltrados.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* ── LISTAGEM ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {carregando ? (
                    <div className="p-20 flex items-center justify-center gap-3 text-slate-400 text-sm font-medium animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" /> Carregando patrimônio...
                    </div>
                ) : bensFiltrados.length === 0 ? (
                    <div className="p-20 text-center">
                        <Archive className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 italic text-sm">Nenhum bem encontrado.</p>
                        <button
                            onClick={handleAbrirModal}
                            className="mt-4 text-violet-600 font-bold text-xs hover:underline"
                        >
                            + Cadastrar o primeiro bem
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── DESKTOP TABLE ── */}
                        <table className="w-full text-left border-collapse hidden lg:table">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                                    <th className="px-6 py-4">Nº Patrimônio</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Setor Alocado</th>
                                    <th className="px-6 py-4">Data Entrada</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bensFiltrados.map(bem => (
                                    <tr key={bem.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3.5 font-mono text-xs font-black text-violet-700 tracking-tight">
                                            {bem.numeroPatrimonio}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm font-semibold text-slate-800 max-w-xs truncate">
                                            {bem.descricao}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                {bem.setor?.nome || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs font-mono text-slate-500">
                                            {new Date(bem.dataEntrada).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <StatusBadge status={bem.status} />
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <button
                                                onClick={(e) => handleDeletar(e, bem.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir bem"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── MOBILE CARDS ── */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {bensFiltrados.map(bem => (
                                <div key={bem.id} className="p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <span className="font-mono text-xs font-black text-violet-700 tracking-tight">
                                            {bem.numeroPatrimonio}
                                        </span>
                                        <StatusBadge status={bem.status} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 leading-snug">
                                        {bem.descricao}
                                    </p>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {bem.setor?.nome || '—'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {new Date(bem.dataEntrada).toLocaleDateString('pt-BR')}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeletar(e, bem.id)}
                                                className="text-slate-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── MODAL NOVO BEM ── */}
            <Modal
                isOpen={modalAberto}
                onClose={handleFecharModal}
                title="Cadastrar Novo Bem Permanente"
                variant="blue"
                width="max-w-lg"
            >
                <div className="flex flex-col gap-5">
                    {/* Aviso de erro */}
                    {erroForm && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-xs text-red-700 font-medium">{erroForm}</p>
                        </div>
                    )}

                    {/* Número de Patrimônio */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Nº Patrimônio <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ex: 00145-PM-2024"
                                value={form.numeroPatrimonio}
                                onChange={e => handleFormChange('numeroPatrimonio', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Descrição do Bem <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Computador Dell Optiplex 3080 i5"
                            value={form.descricao}
                            onChange={e => handleFormChange('descricao', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                        />
                    </div>

                    {/* Setor de Destino — dinâmico via API */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Setor de Destino <span className="text-red-400">*</span>
                        </label>
                        {carregandoSetores ? (
                            <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-sm text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" /> Carregando setores...
                            </div>
                        ) : (
                            <div className="relative">
                                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={form.setorId}
                                    onChange={e => handleFormChange('setorId', e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                                >
                                    <option value="">Selecione o setor...</option>
                                    {setores.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {/* Data de Entrada + Status — linha 2 campos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Data de Entrada
                            </label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={form.dataEntrada}
                                    onChange={e => handleFormChange('dataEntrada', e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Status
                            </label>
                            <div className="relative">
                                <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={form.status}
                                    onChange={e => handleFormChange('status', e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                    <option value="MANUTENÇÃO">Manutenção</option>
                                    <option value="BAIXADO">Baixado</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Rodapé do Modal */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleFecharModal}
                            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSalvar}
                            disabled={salvando || !form.numeroPatrimonio || !form.descricao || !form.setorId}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-7 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {salvando
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando...</>
                                : <><Archive className="w-4 h-4" /> Cadastrar Bem</>
                            }
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
