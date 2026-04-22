/**
 * @file auth.js
 * @description Funções utilitárias para verificação de segurança e permissões no Frontend.
 * Centraliza a lógica para evitar duplicações e blindar a interface contra erros nulos.
 * @module Frontend/Utils/Auth
 */

/**
 * Valida se um usuário possui permissão de acesso a um determinado setor.
 * Inclui proteções estritas contra dados nulos ou malformados.
 * 
 * @param {Object} usuario - Objeto do usuário logado.
 * @param {string} setorExigido - Nome do setor necessário para acesso.
 * @returns {boolean} true se tiver permissão, false caso contrário.
 */
export const hasPermission = (usuario, setorExigido) => {
  // 1. Defesa primária: Se não houver usuário logado, barra na hora.
  if (!usuario) return false;
  
  // 2. Se for Administrador, possui acesso global automático.
  // Nota de Segurança: No frontend isso pode ser "spoofado" via LocalStorage.
  // A API backend DEVE revalidar isso no momento do request!
  if (usuario.isAdmin === true) return true;
  
  // 3. Se a rota exigir um setor específico, faz a checagem rigorosa
  if (setorExigido) {
    if (!usuario.setores || !Array.isArray(usuario.setores)) {
      return false; // Retorna falso se o array não existir, evitando crashes.
    }
    return usuario.setores.some((setor) => setor.nome === setorExigido);
  }

  // Se a rota não exige setor específico e o usuário existe, permite acesso livre.
  return true;
};
