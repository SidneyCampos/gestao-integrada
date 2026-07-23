/**
 * @file Relatorios.jsx
 * @description Central de Inteligência e Relatórios com Exportação PDF Oficial.
 * @module Frontend/Pages/Relatorios
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
    PieChart, 
    Calendar, 
    Building2, 
    Printer, 
    TrendingUp, 
    FileText, 
    Package, 
    ShoppingBag,
    Filter,
    History,
    CheckCircle2,
    Cpu,
    Archive,
    Heart,
    ShoppingCart
} from 'lucide-react';
import api from '../api/api';
import { hasPermission } from '../utils/auth';

export default function Relatorios({ usuarioLogado }) {
    const [abaAtiva, setAbaAtiva] = useState("consumo");
    const [carregando, setCarregando] = useState(false);
    const [dadosConsumo, setDadosConsumo] = useState(null);
    const [dadosFerramentas, setDadosFerramentas] = useState(null);
    const [dadosTI, setDadosTI] = useState(null);
    const [dadosBens, setDadosBens] = useState(null);
    const [setores, setSetores] = useState([]);
    const [filtros, setFiltros] = useState({
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
        setor: "",
        setorId: "",
        status: ""
    });

    useEffect(() => {
        buscarSetores();
        carregarRelatorio();
    }, [abaAtiva]);

    const buscarSetores = async () => {
        try {
            const res = await api.get('/core/setores');
            setSetores(res.data);
        } catch (erro) { console.error(erro); }
    };

    const carregarRelatorio = async () => {
        try {
            setCarregando(true);
            if (abaAtiva === "consumo") {
                const query = new URLSearchParams({ dataInicio: filtros.dataInicio, dataFim: filtros.dataFim, setor: filtros.setor }).toString();
                const res = await api.get(`/relatorios/consumo?${query}`);
                setDadosConsumo(res.data);
            } else if (abaAtiva === "ferramentas") {
                const res = await api.get('/relatorios/ferramentas');
                setDadosFerramentas(res.data);
            } else if (abaAtiva === "ti") {
                const res = await api.get('/relatorios/ti');
                setDadosTI(res.data);
            } else if (abaAtiva === "bens") {
                const params = new URLSearchParams();
                if (filtros.setorId) params.set('setorId', filtros.setorId);
                if (filtros.status)  params.set('status',  filtros.status);
                params.set('dataInicio', filtros.dataInicio);
                params.set('dataFim',    filtros.dataFim);
                const res = await api.get(`/relatorios/bens-permanentes?${params.toString()}`);
                setDadosBens(res.data);
            }
        } catch (erro) {
            console.error(erro);
        } finally {
            setCarregando(false);
        }
    };

    const logoSetor = useMemo(() => {
        const setorFiltro = (filtros.setor || '').toUpperCase();
        
        if (setorFiltro.includes('CIVIL') || setorFiltro.includes('PC')) {
            return { path: '/logo-pc.png', nome: 'POLÍCIA CIVIL' };
        }
        if (setorFiltro.includes('MILITAR') || setorFiltro.includes('PM')) {
            return { path: '/logo-pm.png', nome: 'POLÍCIA MILITAR' };
        }

        if (abaAtiva === 'consumo' && dadosConsumo?.registros?.length > 0) {
            const depts = Array.from(new Set(dadosConsumo.registros.map(r => (r.departamentoDestino || '').toUpperCase())));
            if (depts.length === 1) {
                if (depts[0].includes('CIVIL')) return { path: '/logo-pc.png', nome: 'POLÍCIA CIVIL' };
                if (depts[0].includes('MILITAR')) return { path: '/logo-pm.png', nome: 'POLÍCIA MILITAR' };
            }
        }

        return null;
    }, [filtros.setor, abaAtiva, dadosConsumo]);

    const handlePrint = () => window.print();

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            
            {/* ================= CABEÇALHO OFICIAL (APARECE APENAS NO PDF/PRINT) ================= */}
            <div className="hidden print:flex flex-col mb-8 pb-6 border-b-2 border-slate-900">
                <div className="flex items-center justify-between gap-4 mb-4">
                    {/* Logo Prefeitura */}
                    <div className="w-48 flex items-center justify-start">
                        <img src="/logo-completo.png" alt="Prefeitura Municipal de Iguatama" className="h-16 w-auto object-contain" />
                    </div>

                    {/* Títulos Centrais */}
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Prefeitura Municipal de Iguatama
                        </h1>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                            Estado de Minas Gerais
                        </p>
                        {logoSetor && (
                            <div className="mt-1">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider bg-slate-100 py-0.5 px-3 rounded-full border border-slate-300">
                                    {logoSetor.nome}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Logo Específico (Polícia Civil / Militar) ou Emblema */}
                    <div className="w-48 flex items-center justify-end">
                        {logoSetor ? (
                            <img src={logoSetor.path} alt={logoSetor.nome} className="h-16 w-auto object-contain max-w-[150px]" />
                        ) : (
                            <img src="/logo-circular.png" alt="Emblema Municipal" className="h-14 w-auto object-contain" />
                        )}
                    </div>
                </div>

                {/* Banner do Nome do Relatório */}
                <div className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg text-center shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest">
                        RELATÓRIO: {abaAtiva === 'consumo' ? 'MATERIAIS DE CONSUMO' : abaAtiva === 'ti' ? 'INVENTÁRIO DE TI' : 'GESTÃO DE PATRIMÔNIO E FERRAMENTAS'}
                    </h2>
                </div>

                {/* Barra de Informações do Documento */}
                <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[10px] font-bold text-slate-700 uppercase">
                    <div><span className="text-slate-400 font-normal">PERÍODO:</span> {new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} até {new Date(filtros.dataFim).toLocaleDateString('pt-BR')}</div>
                    <div><span className="text-slate-400 font-normal">EMITIDO POR:</span> {usuarioLogado?.nome || 'ADMINISTRADOR'}</div>
                    <div><span className="text-slate-400 font-normal">EXTRAÍDO EM:</span> {new Date().toLocaleString('pt-BR')}</div>
                </div>
            </div>

            {/* HEADER INTERATIVO (SOME NO PRINT) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 print:hidden">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl shadow-slate-200">
                            <PieChart className="w-6 h-6 text-white" />
                        </div>
                        Insights & Relatórios
                    </h1>
                </div>
                <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95">
                    <Printer className="w-5 h-5" /> Gerar PDF Oficial
                </button>
            </div>

            {/* SELEÇÃO E FILTROS (SOME NO PRINT) */}
            <div className="print:hidden">
                <div className="flex flex-wrap md:flex-nowrap bg-slate-200/50 p-1 rounded-xl w-full max-w-3xl mb-8 gap-1">
                    <button onClick={() => setAbaAtiva("consumo")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${abaAtiva === "consumo" ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                        <span className="hidden sm:inline">Materiais de </span>Consumo
                    </button>
                    <button onClick={() => setAbaAtiva("ferramentas")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${abaAtiva === "ferramentas" ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
                        <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                        <span className="hidden sm:inline">Ferramentas / </span>Patrimônio
                    </button>
                    <button onClick={() => setAbaAtiva("bens")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${abaAtiva === "bens" ? "bg-white text-violet-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
                        <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                        <span className="hidden sm:inline">Bens </span>Permanentes
                    </button>
                    {hasPermission(usuarioLogado, "TI") && (
                        <button onClick={() => setAbaAtiva("ti")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${abaAtiva === "ti" ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
                            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                            TI
                        </button>
                    )}
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Data Inicial</label>
                            <input type="date" value={filtros.dataInicio} onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Data Final</label>
                            <input type="date" value={filtros.dataFim} onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                        </div>
                        {abaAtiva === "consumo" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Setor</label>
                                <select value={filtros.setor} onChange={(e) => setFiltros({...filtros, setor: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                                    <option value="">Todos</option>
                                    {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                                </select>
                            </div>
                        )}
                        {abaAtiva === "bens" && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Setor</label>
                                    <select value={filtros.setorId} onChange={(e) => setFiltros({...filtros, setorId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                                        <option value="">Todos</option>
                                        {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Status</label>
                                    <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                                        <option value="">Todos</option>
                                        <option value="ATIVO">Ativo</option>
                                        <option value="INATIVO">Inativo</option>
                                        <option value="MANUTENÇÃO">Manutenção</option>
                                        <option value="BAIXADO">Baixado</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <button onClick={carregarRelatorio} disabled={carregando} className="bg-slate-900 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                            {carregando ? "Processando..." : <><TrendingUp className="w-4 h-4" /> Analisar Dados</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO ANALÍTICO (SOME NO PRINT) */}
            <div className="print:hidden">
                {abaAtiva === "consumo" && dadosConsumo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{dadosConsumo.resumo.totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens Movimentados</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{dadosConsumo.resumo.totalItens} <span className="text-xs font-medium text-slate-400 tracking-normal">unid.</span></h2>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requisições</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{dadosConsumo.resumo.quantidadeRequisicoes}</h2>
                        </div>
                    </div>
                )}

                {abaAtiva === "bens" && dadosBens && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Bens</p>
                            <h2 className="text-2xl font-black text-slate-900">{dadosBens.resumo.totalBens}</h2>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ativos</p>
                            <h2 className="text-2xl font-black text-emerald-600">{dadosBens.resumo.totalAtivos}</h2>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adquiridos</p>
                            <h2 className="text-2xl font-black text-blue-600">{dadosBens.resumo.totalAdquiridos}</h2>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
                            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Doações</p>
                            <h2 className="text-2xl font-black text-pink-600">{dadosBens.resumo.totalDoacoes}</h2>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                            <h2 className="text-lg font-black text-slate-900 leading-tight">{dadosBens.resumo.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                        </div>
                    </div>
                )}

                {abaAtiva === "ti" && dadosTI && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens de TI</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{dadosTI.resumo.totalFerramentas}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Categorias</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{dadosTI.resumo.totalTipos}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empréstimos Ativos</p>
                            <h2 className="text-3xl font-black text-blue-600 tracking-tighter">{dadosTI.resumo.totalEmprestadas}</h2>
                        </div>
                    </div>
                )}
            </div>

            {/* ================= TABELAS OFICIAIS (ESSA É A PARTE QUE FICA NO PDF) ================= */}
            <div className="bg-white rounded-3xl print:rounded-none overflow-hidden print:overflow-visible">
                {carregando ? (
                    <div className="p-20 text-center text-slate-400 animate-pulse font-black uppercase text-xs tracking-widest print:hidden">Gerando Documento...</div>
                ) : abaAtiva === "consumo" && dadosConsumo ? (
                    <div className="print:block">
                        <table className="w-full text-left border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100 print:bg-slate-200 border-b-2 border-slate-300 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                    <th className="px-6 py-4 border-r border-slate-300">Data</th>
                                    <th className="px-6 py-4 border-r border-slate-300">Departamento Destino</th>
                                    <th className="px-6 py-4 border-r border-slate-300">Mês Ref.</th>
                                    <th className="px-6 py-4 border-r border-slate-300">Responsável</th>
                                    <th className="px-6 py-4 text-right">Valor Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {dadosConsumo.registros.map(reg => (
                                    <tr key={reg.id} className="text-[11px] font-medium print:break-inside-avoid">
                                        <td className="px-6 py-3 border-r border-slate-200 font-mono">{new Date(reg.dataRegistro).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-3 border-r border-slate-200 font-black uppercase">{reg.departamentoDestino}</td>
                                        <td className="px-6 py-3 border-r border-slate-200 font-bold">{reg.mesReferencia}</td>
                                        <td className="px-6 py-3 border-r border-slate-200 uppercase">{reg.usuario.nome}</td>
                                        <td className="px-6 py-3 text-right font-black">{reg.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-900 text-white font-black text-sm uppercase">
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-right border-r border-slate-700">Total Consolidado:</td>
                                    <td className="px-6 py-4 text-right">{dadosConsumo.resumo.totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : abaAtiva === "bens" && dadosBens ? (
                    <div className="print:block">
                        <table className="w-full text-left border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100 print:bg-slate-200 border-b-2 border-slate-300 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                    <th className="px-4 py-3 border-r border-slate-300">Nº Patrimônio</th>
                                    <th className="px-4 py-3 border-r border-slate-300">Descrição</th>
                                    <th className="px-4 py-3 border-r border-slate-300">Setor</th>
                                    <th className="px-4 py-3 border-r border-slate-300">Entrada</th>
                                    <th className="px-4 py-3 border-r border-slate-300 text-center">Origem / Doador</th>
                                    <th className="px-4 py-3 border-r border-slate-300 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Valor (R$)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {dadosBens.registros.map(bem => (
                                    <tr key={bem.id} className="text-[11px] font-medium print:break-inside-avoid">
                                        <td className="px-4 py-2.5 border-r border-slate-200 font-mono font-black text-violet-700">{bem.numeroPatrimonio}</td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 font-semibold">{bem.descricao}</td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 font-bold uppercase">{bem.setor?.nome || '—'}</td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 font-mono">{new Date(bem.dataEntrada).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 text-center">
                                            {bem.origem === 'DOACAO'
                                                ? <><span className="font-black text-pink-700">Doação</span>{bem.doador && <><br/><span className="text-[9px] text-slate-500">{bem.doador}</span></>}</>
                                                : <span className="font-black text-blue-700">Adquirido</span>
                                            }
                                        </td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 text-center font-black uppercase">{bem.status}</td>
                                        <td className="px-4 py-2.5 text-right font-black">
                                            {bem.valorBem != null ? bem.valorBem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-900 text-white font-black text-sm uppercase">
                                <tr>
                                    <td colSpan="6" className="px-4 py-3 text-right border-r border-slate-700">Valor Total Registrado:</td>
                                    <td className="px-4 py-3 text-right">{dadosBens.resumo.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : abaAtiva === "ferramentas" && dadosFerramentas ? (
                    <div className="space-y-10">
                        {/* Tabela de Inventário */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-slate-900 pl-3">Inventário de Patrimônio</h3>
                            <table className="w-full text-left border-collapse border border-slate-300">
                                <thead className="bg-slate-100 border-b-2 border-slate-300 text-[10px] font-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border-r border-slate-300">Ferramenta / Descrição</th>
                                        <th className="px-6 py-4 border-r border-slate-300">Patrimônio</th>
                                        <th className="px-6 py-4 text-center border-r border-slate-300">Total</th>
                                        <th className="px-6 py-4 text-center">Disponível</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosFerramentas.inventario.map(inv => (
                                        <tr key={inv.id} className="text-[11px] font-medium border-b border-slate-200">
                                            <td className="px-6 py-3 border-r border-slate-200 font-black uppercase">{inv.nome}</td>
                                            <td className="px-6 py-3 border-r border-slate-200 font-mono">{inv.codigoPatrimonio || "S/N"}</td>
                                            <td className="px-6 py-3 text-center border-r border-slate-200 font-bold">{inv.quantidadeTotal}</td>
                                            <td className="px-6 py-3 text-center font-black text-blue-600">{inv.qtdDisponivel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tabela de Empréstimos Ativos */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-blue-600 pl-3">Empréstimos em Campo (Pendentes)</h3>
                            <table className="w-full text-left border-collapse border border-slate-300">
                                <thead className="bg-slate-100 border-b-2 border-slate-300 text-[10px] font-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border-r border-slate-300">Funcionário</th>
                                        <th className="px-6 py-4 border-r border-slate-300">Material Retirado</th>
                                        <th className="px-6 py-4 border-r border-slate-300">Data de Saída</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosFerramentas.emprestimosAtivos.map(emp => (
                                        <tr key={emp.id} className="text-[11px] font-medium border-b border-slate-200">
                                            <td className="px-6 py-3 border-r border-slate-200 font-black uppercase">{emp.usuario.nome}</td>
                                            <td className="px-6 py-3 border-r border-slate-200 font-bold">{emp.ferramenta.nome}</td>
                                            <td className="px-6 py-3 border-r border-slate-200 font-mono">{new Date(emp.dataSaida).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-center uppercase font-black text-amber-600">Pendente</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : abaAtiva === "ti" && dadosTI ? (
                    <div className="space-y-10">
                        {/* Tabela de Inventário TI */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-blue-600 pl-3">Inventário Exclusivo - TI</h3>
                            <table className="w-full text-left border-collapse border border-slate-300">
                                <thead className="bg-slate-50 border-b-2 border-slate-300 text-[10px] font-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border-r border-slate-300">Item / Hardware</th>
                                        <th className="px-6 py-4 border-r border-slate-300">Patrimônio</th>
                                        <th className="px-6 py-4 text-center border-r border-slate-300">Total</th>
                                        <th className="px-6 py-4 text-center">Disponível</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosTI.inventario.map(inv => (
                                        <tr key={inv.id} className="text-[11px] font-medium border-b border-slate-200">
                                            <td className="px-6 py-3 border-r border-slate-200 font-black uppercase">{inv.nome}</td>
                                            <td className="px-6 py-3 border-r border-slate-200 font-mono">{inv.codigoPatrimonio || "S/N"}</td>
                                            <td className="px-6 py-3 text-center border-r border-slate-200 font-bold">{inv.quantidadeTotal}</td>
                                            <td className="px-6 py-3 text-center font-black text-blue-600">{inv.qtdDisponivel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tabela de Empréstimos TI */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-slate-900 pl-3">Responsáveis por Equipamentos (TI)</h3>
                            <table className="w-full text-left border-collapse border border-slate-300">
                                <thead className="bg-slate-50 border-b-2 border-slate-300 text-[10px] font-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border-r border-slate-300">Servidor</th>
                                        <th className="px-6 py-4 border-r border-slate-300">Equipamento</th>
                                        <th className="px-6 py-4 border-r border-slate-300">Data de Entrega</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosTI.emprestimosAtivos.map(emp => (
                                        <tr key={emp.id} className="text-[11px] font-medium border-b border-slate-200">
                                            <td className="px-6 py-3 border-r border-slate-200 font-black uppercase">{emp.usuario.nome}</td>
                                            <td className="px-6 py-3 border-r border-slate-200 font-bold">{emp.ferramenta.nome}</td>
                                            <td className="px-6 py-3 border-r border-slate-200 font-mono">{new Date(emp.dataSaida).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-center uppercase font-black text-blue-600">Em Uso</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-20 text-center text-slate-400 italic print:hidden">Utilize os filtros para gerar os dados.</div>
                )}
            </div>

            {/* RODAPÉ OFICIAL (APARECE APENAS NO PDF) */}
            <div className="hidden print:flex flex-col items-center mt-16 pt-8 border-t border-slate-300 gap-8 print:break-inside-avoid">
                <div className="flex justify-center w-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-64 border-t-2 border-slate-900"></div>
                        <p className="text-[11px] font-black uppercase text-slate-900 tracking-wider">Responsável pelo Almoxarifado</p>
                    </div>
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
                    Documento Gerado Eletronicamente pelo Sistema de Gestão Integrada - Iguatama/MG
                </div>
            </div>
        </div>
    );
}
