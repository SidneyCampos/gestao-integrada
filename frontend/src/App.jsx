import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AlmoxarifadoDashboard from "./pages/almoxarifado/AlmoxarifadoDashboard";
import Ferramentas from "./pages/almoxarifado/Ferramentas";
import Login from "./pages/Login";

// ========================================================
// O SEGURANÇA DA PORTA (Route Guard)
// ========================================================
// Este componente envolve as rotas que precisam de proteção.
function RotaProtegida({ usuario, setorExigido, children }) {
  // 1. Se o usuário for Admin, a porta se abre na hora para qualquer lugar.
  if (usuario?.isAdmin) {
    return children;
  }

  // 2. Se não for Admin, procuramos se ele tem a credencial do Setor Exigido
  const temPermissao = usuario?.setores?.some(
    (setor) => setor.nome === setorExigido,
  );

  // 3. Se ele não tem permissão, jogamos ele de volta para a tela inicial "/"
  if (!temPermissao) {
    return <Navigate to="/" replace />;
  }

  // 4. Se ele tem permissão, a porta se abre e o conteúdo (children) é renderizado
  return children;
}

// ========================================================
// TELA INICIAL
// ========================================================
function TelaInicial() {
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Bem-vindo ao Novo Sistema
      </h1>
      <p className="text-slate-600">
        Selecione um setor no menu lateral esquerdo para acessar os painéis
        operacionais.
      </p>
    </div>
  );
}

// ========================================================
// APLICATIVO PRINCIPAL
// ========================================================
export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const handleLogout = () => {
    setUsuarioLogado(null);
  };

  if (!usuarioLogado) {
    return <Login onLogin={(dados) => setUsuarioLogado(dados)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout usuario={usuarioLogado} onLogout={handleLogout} />}
        >
          {/* A Tela Inicial não tem restrição, qualquer logado vê */}
          <Route index element={<TelaInicial />} />

          {/* ROTAS DO ALMOXARIFADO (AGORA PROTEGIDAS!) */}
          <Route
            path="almoxarifado"
            element={
              <RotaProtegida
                usuario={usuarioLogado}
                setorExigido="Almoxarifado"
              >
                <AlmoxarifadoDashboard />
              </RotaProtegida>
            }
          />

          <Route
            path="almoxarifado/ferramentas"
            element={
              <RotaProtegida
                usuario={usuarioLogado}
                setorExigido="Almoxarifado"
              >
                <Ferramentas />
              </RotaProtegida>
            }
          />

          {/* ROTAS FUTURAS (Exemplo de escalabilidade):
          <Route path="rh" element={
            <RotaProtegida usuario={usuarioLogado} setorExigido="Recursos Humanos">
              <TelaDoRH />
            </RotaProtegida>
          } />
          */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
