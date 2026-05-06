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
    Cpu
} from 'lucide-react';
import api from '../api/api';
import { hasPermission } from '../utils/auth';

export default function SystemReports({ usuarioLogado }) {
    const [abaAtiva, setAbaAtiva] = useState("consumo");
    const [carregando, setCarregando] = useState(false);
    const [dadosConsumo, setDadosConsumo] = useState(null);
    const [dadosFerramentas, setDadosFerramentas] = useState(null);
    const [dadosTI, setDadosTI] = useState(null);
    const [setores, setSetores] = useState([]);
    const [filtros, setFiltros] = useState({
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
        setor: ""
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
                const query = new URLSearchParams(filtros).toString();
                const res = await api.get(`/relatorios/consumo?${query}`);
                setDadosConsumo(res.data);
            } else if (abaAtiva === "ferramentas") {
                const res = await api.get('/relatorios/ferramentas');
                setDadosFerramentas(res.data);
            } else if (abaAtiva === "ti") {
                const res = await api.get('/relatorios/ti');
                setDadosTI(res.data);
            }
        } catch (erro) {
            console.error(erro);
        } finally {
            setCarregando(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* ================= CABEÇALHO OFICIAL (APARECE APENAS NO PDF/PRINT) ================= */}
            <div className="hidden print:flex flex-col items-center text-center mb-10 border-b border-black pb-6">
                <div className="flex items-center gap-4 mb-4">
                    {/* Logo da Prefeitura dentro do círculo */}
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-black flex-shrink-0">
                        <img src="/logo-completo.png" alt="Logo" className="w-20 h-20 object-contain" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-2xl font-black text-black uppercase">Prefeitura Municipal de Iguatama</h1>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">Estado de Minas Gerais</p>
                    </div>
                    {/* Logo Polícia Civil (Condicional) */}
                    {(filtros.setor.toUpperCase().includes("POLICIA CIVIL") || filtros.setor.toUpperCase().includes("PC")) && (
                        <img src="/logo-pc.png" alt="Polícia Civil" className="h-20 object-contain ml-8" />
                    )}
                    {/* Logo Polícia Militar (Condicional) */}
                    {(filtros.setor.toUpperCase().includes("POLICIA MILITAR") || filtros.setor.toUpperCase().includes("PM")) && (
                        <img src="/logo-pm.png" alt="Polícia Militar" className="h-20 object-contain ml-8" />
                    )}
                </div>
                <div className="w-full mt-4">
                    <hr className="border-black" />
                    <h2 className="text-center text-lg font-black uppercase tracking-widest py-3 text-black">
                        Relatório: {abaAtiva === 'consumo' ? 'Materiais de Consumo' : abaAtiva === 'ti' ? 'Inventário de TI' : 'Gestão de Patrimônio e Ferramentas'}
                    </h2>
                    <hr className="border-black" />
                </div>
                <div className="mt-4 flex justify-between w-full text-[10px] font-bold text-black uppercase">
                    <span>Período: {new Date(filtros.dataInicio).toLocaleDateString('pt-BR')} até {new Date(filtros.dataFim).toLocaleDateString('pt-BR')}</span>
                    <span>Emitido por: {usuarioLogado?.nome}</span>
                    <span>Extraído em: {new Date().toLocaleString('pt-BR')}</span>
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
                            <input type="date" value={filtros.dataInicio} onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Data Final</label>
                            <input type="date" value={filtros.dataFim} onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                        </div>
                        {abaAtiva === "consumo" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Setor</label>
                                <select value={filtros.setor} onChange={(e) => setFiltros({ ...filtros, setor: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                                    <option value="">Todos</option>
                                    {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                                </select>
                            </div>
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
                        <table className="w-full text-left border-collapse border border-black">
                            <thead>
                                <tr className="border-b border-black text-[10px] font-bold text-black uppercase tracking-widest">
                                    <th className="px-3 py-3 border border-black text-black">Data</th>
                                    <th className="px-3 py-3 border border-black text-black">Departamento Destino</th>
                                    <th className="px-3 py-3 border border-black text-black">Mês Ref.</th>
                                    <th className="px-3 py-3 border border-black text-black">Descrição do Produto</th>
                                    <th className="px-3 py-3 border border-black text-black text-center">Qtd.</th>
                                    <th className="px-3 py-3 border border-black text-black text-right">Valor Unitário</th>
                                    <th className="px-3 py-3 border border-black text-black text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dadosConsumo.registros.flatMap(reg =>
                                    reg.itens.map(item => (
                                        <tr key={item.id} className="text-[10px] print:break-inside-avoid">
                                            <td className="px-3 py-2 border border-black text-black font-mono whitespace-nowrap">
                                                {new Date(reg.dataRegistro).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-3 py-2 border border-black text-black font-bold uppercase">
                                                {reg.departamentoDestino}
                                            </td>
                                            <td className="px-3 py-2 border border-black text-black">
                                                {reg.mesReferencia}
                                            </td>
                                            <td className="px-3 py-2 border border-black text-black uppercase">
                                                {item.descricaoProduto}
                                            </td>
                                            <td className="px-3 py-2 border border-black text-black text-center">
                                                {item.quantidade}
                                            </td>
                                            <td className="px-3 py-2 border border-black text-black text-right">
                                                {(item.valorUnitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-3 py-2 border border-black text-black text-right font-bold">
                                                {(item.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="border-t border-black font-black text-sm uppercase">
                                <tr>
                                    <td colSpan="6" className="px-3 py-3 text-right border border-black text-black uppercase">Total Consolidado:</td>
                                    <td className="px-3 py-3 text-right border border-black text-black">{(dadosConsumo.resumo?.totalGeral || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : abaAtiva === "ferramentas" && dadosFerramentas ? (
                    <div className="space-y-10">
                        {/* Tabela de Inventário */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-black pl-3 text-black">Inventário de Patrimônio</h3>
                            <table className="w-full text-left border-collapse border border-black">
                                <thead className="border-b border-black text-[10px] font-bold text-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border border-black text-black">Ferramenta / Descrição</th>
                                        <th className="px-6 py-4 border border-black text-black">Patrimônio</th>
                                        <th className="px-6 py-4 text-center border border-black text-black">Total</th>
                                        <th className="px-6 py-4 text-center border border-black text-black">Disponível</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosFerramentas.inventario.map(inv => (
                                        <tr key={inv.id} className="text-[11px] font-medium print:break-inside-avoid">
                                            <td className="px-6 py-3 border border-black text-black font-black uppercase">{inv.nome}</td>
                                            <td className="px-6 py-3 border border-black text-black font-mono">{inv.codigoPatrimonio || "S/N"}</td>
                                            <td className="px-6 py-3 text-center border border-black text-black font-bold">{inv.quantidadeTotal}</td>
                                            <td className="px-6 py-3 text-center border border-black text-black font-black">{inv.qtdDisponivel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tabela de Empréstimos Ativos */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-black pl-3 text-black">Empréstimos em Campo (Pendentes)</h3>
                            <table className="w-full text-left border-collapse border border-black">
                                <thead className="border-b border-black text-[10px] font-bold text-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border border-black text-black">Funcionário</th>
                                        <th className="px-6 py-4 border border-black text-black">Material Retirado</th>
                                        <th className="px-6 py-4 border border-black text-black">Data de Saída</th>
                                        <th className="px-6 py-4 text-center border border-black text-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosFerramentas.emprestimosAtivos.map(emp => (
                                        <tr key={emp.id} className="text-[11px] font-medium print:break-inside-avoid">
                                            <td className="px-6 py-3 border border-black text-black font-black uppercase">{emp.usuario.nome}</td>
                                            <td className="px-6 py-3 border border-black text-black font-bold">{emp.ferramenta.nome}</td>
                                            <td className="px-6 py-3 border border-black text-black font-mono">{new Date(emp.dataSaida).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-center border border-black text-black uppercase font-black">Pendente</td>
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
                            <h3 className="text-xs font-black uppercase border-l-4 border-black pl-3 text-black">Inventário Exclusivo - TI</h3>
                            <table className="w-full text-left border-collapse border border-black">
                                <thead className="border-b border-black text-[10px] font-bold text-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border border-black text-black">Item / Hardware</th>
                                        <th className="px-6 py-4 border border-black text-black">Patrimônio</th>
                                        <th className="px-6 py-4 text-center border border-black text-black">Total</th>
                                        <th className="px-6 py-4 text-center border border-black text-black">Disponível</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosTI.inventario.map(inv => (
                                        <tr key={inv.id} className="text-[11px] font-medium print:break-inside-avoid">
                                            <td className="px-6 py-3 border border-black text-black font-black uppercase">{inv.nome}</td>
                                            <td className="px-6 py-3 border border-black text-black font-mono">{inv.codigoPatrimonio || "S/N"}</td>
                                            <td className="px-6 py-3 text-center border border-black text-black font-bold">{inv.quantidadeTotal}</td>
                                            <td className="px-6 py-3 text-center border border-black text-black font-black">{inv.qtdDisponivel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tabela de Empréstimos TI */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase border-l-4 border-black pl-3 text-black">Responsáveis por Equipamentos (TI)</h3>
                            <table className="w-full text-left border-collapse border border-black">
                                <thead className="border-b border-black text-[10px] font-bold text-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border border-black text-black">Servidor</th>
                                        <th className="px-6 py-4 border border-black text-black">Equipamento</th>
                                        <th className="px-6 py-4 border border-black text-black">Data de Entrega</th>
                                        <th className="px-6 py-4 text-center border border-black text-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosTI.emprestimosAtivos.map(emp => (
                                        <tr key={emp.id} className="text-[11px] font-medium print:break-inside-avoid">
                                            <td className="px-6 py-3 border border-black text-black font-black uppercase">{emp.usuario.nome}</td>
                                            <td className="px-6 py-3 border border-black text-black font-bold">{emp.ferramenta.nome}</td>
                                            <td className="px-6 py-3 border border-black text-black font-mono">{new Date(emp.dataSaida).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-center border border-black text-black uppercase font-black">Em Uso</td>
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
            <div className="hidden print:flex flex-col items-center mt-16 pt-8 border-t border-black gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-56 border-t border-black"></div>
                    <p className="text-[10px] font-black text-black uppercase">Responsável pelo Almoxarifado</p>
                </div>
                <div className="text-[9px] text-black font-bold uppercase tracking-widest text-center">
                    Documento Gerado Eletronicamente pelo Sistema de Gestão Integrada - Iguatama/MG
                </div>
            </div>
        </div>
    );
}
