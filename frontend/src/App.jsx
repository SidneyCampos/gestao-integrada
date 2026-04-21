import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AlmoxarifadoDashboard from "./pages/almoxarifado/AlmoxarifadoDashboard";
import Ferramentas from "./pages/almoxarifado/Ferramentas";
import Login from "./pages/Login";

function RotaProtegida({ usuario, setorExigido, children }) {
  if (usuario?.isAdmin) return children;
  const temPermissao = usuario?.setores?.some(
    (setor) => setor.nome === setorExigido,
  );
  if (!temPermissao) return <Navigate to="/" replace />;
  return children;
}

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

export default function App() {
  // ================= A MÁGICA DA MEMÓRIA (LocalStorage) =================
  // Ao ligar o app, ele procura no "HD do navegador" se já existe um crachá salvo.
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const crachaSalvo = localStorage.getItem("usuarioPrefHub");
    return crachaSalvo ? JSON.parse(crachaSalvo) : null;
  });

  // Função para fazer Login e salvar o crachá
  const handleLoginSuccess = (dadosUsuario) => {
    setUsuarioLogado(dadosUsuario);
    // Salva no HD do navegador (transformando em texto)
    localStorage.setItem("usuarioPrefHub", JSON.stringify(dadosUsuario));
  };

  // Função para Sair e rasgar o crachá
  const handleLogout = () => {
    setUsuarioLogado(null);
    // Apaga do HD do navegador
    localStorage.removeItem("usuarioPrefHub");
  };

  if (!usuarioLogado) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout usuario={usuarioLogado} onLogout={handleLogout} />}
        >
          <Route index element={<TelaInicial />} />

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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
