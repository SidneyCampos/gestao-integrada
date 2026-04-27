import React from "react";
import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/auth";

/**
 * Wrapper de Rota Protegida.
 * Verifica se o usuário logado tem permissão (setor) para acessar a página filha.
 */
export default function ProtectedRoute({ usuario, setorExigido, children }) {
  const acessoLiberado = hasPermission(usuario, setorExigido);
  
  if (!acessoLiberado) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
