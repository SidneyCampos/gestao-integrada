/**
 * @file HeaderOrdenavel.jsx
 * @description Componente de cabeçalho (<th>) reutilizável para tabelas com ordenação ao clicar.
 * Exibe a seta de direção (crescente/decrescente) e destaca a coluna quando ativa.
 * @module Frontend/Components/HeaderOrdenavel
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

/**
 * Componente de Cabeçalho de Tabela Ordenável.
 * 
 * @param {Object} props
 * @param {string} props.campo - Chave da propriedade (ex: 'descricao', 'setor.nome')
 * @param {string} [props.label] - Rótulo textual da coluna
 * @param {Object} props.sortConfig - Objeto de estado da ordenação { campo, direcao }
 * @param {Function} props.onSort - Função para alternar ordenação (alternarOrdenacao)
 * @param {'left'|'center'|'right'} [props.align='left'] - Alinhamento do conteúdo
 * @param {string} [props.className=''] - Classes Tailwind adicionais para a célula <th>
 * @param {boolean} [props.desabilitado=false] - Se true, não permite ordenação nesta coluna
 * @param {React.ReactNode} [props.children] - Rótulo customizado (opcional)
 */
export default function HeaderOrdenavel({
    campo,
    label,
    sortConfig,
    onSort,
    align = 'left',
    className = '',
    desabilitado = false,
    children
}) {
    const estaAtivo = sortConfig?.campo === campo && sortConfig?.direcao != null;
    const direcao = estaAtivo ? sortConfig.direcao : null;

    const alignClasses = {
        left: 'justify-start text-left',
        center: 'justify-center text-center',
        right: 'justify-end text-right'
    }[align] || 'justify-start text-left';

    if (desabilitado || !campo || !onSort) {
        return (
            <th className={`px-5 py-4 ${className} ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
                {children || label}
            </th>
        );
    }

    return (
        <th
            onClick={() => onSort(campo)}
            className={`px-5 py-3.5 cursor-pointer select-none transition-colors hover:bg-slate-100/80 group ${
                estaAtivo ? 'bg-blue-50/50 text-blue-700 font-extrabold' : ''
            } ${className}`}
            title={`Clique para ordenar por ${label || 'esta coluna'}`}
        >
            <div className={`flex items-center gap-1.5 ${alignClasses}`}>
                <span className={`transition-colors ${estaAtivo ? 'text-blue-700 font-black' : 'group-hover:text-slate-900'}`}>
                    {children || label}
                </span>
                
                <span className="inline-flex shrink-0">
                    {direcao === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                    ) : direcao === 'desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                    ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors opacity-60 group-hover:opacity-100" />
                    )}
                </span>
            </div>
        </th>
    );
}
