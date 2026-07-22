/**
 * @file SetorSelectComCriacao.jsx
 * @description Select de Setor com opção inline de criar novo setor.
 * Componente reutilizável para qualquer formulário que precise escolher um setor
 * e permita cadastrar novos setores sem sair da tela atual.
 *
 * Props:
 * - value (string): setorId selecionado
 * - onChange (fn): callback({ setorId, nomeSetor }) chamado ao selecionar ou criar
 * - setores (array): lista atual de setores
 * - onSetorCriado (fn): callback chamado após criação para atualizar a lista pai
 * - disabled (bool): desabilita o componente
 * @module Frontend/Components/SetorSelectComCriacao
 */

import { useState } from 'react';
import { ChevronDown, Plus, Loader2, Check, Building2, X } from 'lucide-react';
import api from '../api/api';

export default function SetorSelectComCriacao({
    value = '',
    onChange,
    setores = [],
    onSetorCriado,
    carregando = false,
    disabled = false,
}) {
    const [modoNovo, setModoNovo] = useState(false);
    const [novoNome, setNovoNome] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    const handleSelecionar = (e) => {
        const setorId = e.target.value;
        const setorSelecionado = setores.find(s => String(s.id) === String(setorId));
        onChange({
            setorId,
            nomeSetor: setorSelecionado ? setorSelecionado.nome : ''
        });
    };

    const handleCriarSetor = async () => {
        const nomeTrimmed = novoNome.trim().toUpperCase();
        if (!nomeTrimmed) {
            setErro('Informe o nome do setor.');
            return;
        }

        // Verificar se já existe localmente antes de chamar a API
        const jaExiste = setores.find(s => s.nome === nomeTrimmed);
        if (jaExiste) {
            // Se já existe, apenas seleciona ele
            onChange({ setorId: String(jaExiste.id), nomeSetor: jaExiste.nome });
            setModoNovo(false);
            setNovoNome('');
            return;
        }

        try {
            setSalvando(true);
            setErro('');
            const res = await api.post('/core/setores', { nome: nomeTrimmed });
            const setorCriado = res.data;

            // Notifica o pai para atualizar a lista
            if (onSetorCriado) onSetorCriado(setorCriado);

            // Seleciona automaticamente o setor recém-criado
            onChange({ setorId: String(setorCriado.id), nomeSetor: setorCriado.nome });
            setModoNovo(false);
            setNovoNome('');
        } catch (err) {
            setErro(err.response?.data?.erro || 'Erro ao criar setor.');
        } finally {
            setSalvando(false);
        }
    };

    const handleCancelar = () => {
        setModoNovo(false);
        setNovoNome('');
        setErro('');
    };

    if (carregando) {
        return (
            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Carregando setores...
            </div>
        );
    }

    // Modo de criação de novo setor
    if (modoNovo) {
        return (
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Nome do novo setor (ex: RODOVIÁRIA)"
                            value={novoNome}
                            onChange={e => { setNovoNome(e.target.value.toUpperCase()); setErro(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleCriarSetor()}
                            disabled={salvando}
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-400 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 uppercase tracking-wide transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleCriarSetor}
                        disabled={salvando || !novoNome.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95 shrink-0"
                    >
                        {salvando
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <><Check className="w-4 h-4" /> Criar</>
                        }
                    </button>
                    <button
                        onClick={handleCancelar}
                        className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                        title="Cancelar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {erro && (
                    <p className="text-[11px] text-red-600 font-bold pl-1">{erro}</p>
                )}

                <p className="text-[10px] text-slate-400 font-medium pl-1">
                    O setor será salvo em letras maiúsculas e ficará disponível para todo o sistema.
                </p>
            </div>
        );
    }

    // Modo normal: select + botão para abrir criação
    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                        value={value}
                        onChange={handleSelecionar}
                        disabled={disabled}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors disabled:opacity-60"
                    >
                        <option value="">Selecione o setor...</option>
                        {setores.map(s => (
                            <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Botão inline para criar novo setor */}
                <button
                    onClick={() => setModoNovo(true)}
                    disabled={disabled}
                    title="Criar novo setor"
                    className="px-3 py-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shrink-0 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            {/* Hint quando há poucos setores */}
            {setores.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold pl-1">
                    Nenhum setor cadastrado. Clique em <strong>+</strong> para criar o primeiro.
                </p>
            )}
        </div>
    );
}
