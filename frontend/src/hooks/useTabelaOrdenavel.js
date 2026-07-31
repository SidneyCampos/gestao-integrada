/**
 * @file useTabelaOrdenavel.js
 * @description Hook customizado para ordenação e filtragem genérica de tabelas.
 * Suporta acesso a propriedades aninhadas ('setor.nome'), datas, números e textos.
 * @module Frontend/Hooks/useTabelaOrdenavel
 */

import { useState, useMemo } from 'react';

/**
 * Extrai o valor de um objeto dado um caminho de chave (ex: 'setor.nome') ou função extratora.
 */
export function obterValorPorCaminho(obj, caminho) {
    if (!obj || !caminho) return null;
    if (typeof caminho === 'function') return caminho(obj);
    
    return caminho.split('.').reduce((acc, chave) => {
        if (acc && typeof acc === 'object' && chave in acc) {
            return acc[chave];
        }
        return null;
    }, obj);
}

/**
 * Hook para gerenciar ordenação e filtragem de listas para tabelas.
 * @param {Array} dadosOriginal - Array de itens para ordenar e filtrar
 * @param {Object} [configInicial] - Configuração inicial { campo: string, direcao: 'asc' | 'desc' | null }
 */
export function useTabelaOrdenavel(dadosOriginal = [], configInicial = { campo: null, direcao: null }) {
    const [sortConfig, setSortConfig] = useState(configInicial);
    const [filtrosColuna, setFiltrosColuna] = useState({});

    /**
     * Alterna a ordenação de uma coluna: asc -> desc -> null -> asc...
     * @param {string} campoKey - Chave da coluna ou caminho de propriedade
     */
    const alternarOrdenacao = (campoKey) => {
        setSortConfig(prev => {
            if (prev.campo !== campoKey) {
                return { campo: campoKey, direcao: 'asc' };
            }
            if (prev.direcao === 'asc') {
                return { campo: campoKey, direcao: 'desc' };
            }
            return { campo: null, direcao: null };
        });
    };

    /**
     * Define ou limpa o filtro de texto para uma coluna específica.
     */
    const definirFiltroColuna = (campoKey, valor) => {
        setFiltrosColuna(prev => ({
            ...prev,
            [campoKey]: valor
        }));
    };

    /**
     * Limpa a ordenação ativa.
     */
    const limparOrdenacao = () => setSortConfig({ campo: null, direcao: null });

    /**
     * Limpa todos os filtros de coluna.
     */
    const limparFiltros = () => setFiltrosColuna({});

    /**
     * Processa os dados filtrando e ordenando.
     */
    const dadosProcessados = useMemo(() => {
        if (!Array.isArray(dadosOriginal)) return [];

        let resultado = [...dadosOriginal];

        // 1. Filtragem por coluna
        const chavesFiltro = Object.keys(filtrosColuna).filter(k => filtrosColuna[k] !== undefined && filtrosColuna[k] !== '');
        if (chavesFiltro.length > 0) {
            resultado = resultado.filter(item => {
                return chavesFiltro.every(chave => {
                    const termo = String(filtrosColuna[chave]).toLowerCase().trim();
                    if (!termo) return true;

                    const valor = obterValorPorCaminho(item, chave);
                    if (valor == null) return false;

                    return String(valor).toLowerCase().includes(termo);
                });
            });
        }

        // 2. Ordenação
        if (sortConfig.campo && sortConfig.direcao) {
            const { campo, direcao } = sortConfig;
            const multiplicador = direcao === 'asc' ? 1 : -1;

            resultado.sort((itemA, itemB) => {
                const valA = obterValorPorCaminho(itemA, campo);
                const valB = obterValorPorCaminho(itemB, campo);

                // Trata nulos / indefinidos (sempre ao final)
                if (valA == null && valB == null) return 0;
                if (valA == null) return 1;
                if (valB == null) return -1;

                // Números
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * multiplicador;
                }

                // Booleans
                if (typeof valA === 'boolean' && typeof valB === 'boolean') {
                    return (valA === valB ? 0 : valA ? -1 : 1) * multiplicador;
                }

                // Datas (se parecer string de data ou Date object)
                const isDateA = valA instanceof Date || (typeof valA === 'string' && !isNaN(Date.parse(valA)) && (valA.includes('-') || valA.includes('/')));
                const isDateB = valB instanceof Date || (typeof valB === 'string' && !isNaN(Date.parse(valB)) && (valB.includes('-') || valB.includes('/')));
                
                if (isDateA && isDateB) {
                    const timeA = new Date(valA).getTime();
                    const timeB = new Date(valB).getTime();
                    if (!isNaN(timeA) && !isNaN(timeB)) {
                        return (timeA - timeB) * multiplicador;
                    }
                }

                // Strings (com suporte a acentos e números no texto)
                const strA = String(valA);
                const strB = String(valB);
                return strA.localeCompare(strB, 'pt-BR', { numeric: true, sensitivity: 'base' }) * multiplicador;
            });
        }

        return resultado;
    }, [dadosOriginal, sortConfig, filtrosColuna]);

    return {
        dadosProcessados,
        dadosOrdenados: dadosProcessados, // Alias conveniente
        sortConfig,
        filtrosColuna,
        alternarOrdenacao,
        definirFiltroColuna,
        limparOrdenacao,
        limparFiltros
    };
}

export default useTabelaOrdenavel;
