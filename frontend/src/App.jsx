/**
 * @file App.jsx
 * @description Orquestrador principal da interface de usuário.
 * Gerencia o roteamento (React Router), controle de sessão persistente no localStorage,
 * e protege rotas baseadas nos setores (permissões) do usuário logado.
 * @module Frontend/App
 */

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import AlmoxarifadoDashboard from "./pages/almoxarifado/AlmoxarifadoDashboard";
import Ferramentas from "./pages/almoxarifado/Ferramentas";
import Consumo from "./pages/almoxarifado/Consumo";
import Relatorios from "./pages/Relatorios";
import TIDashboard from "./pages/ti/TIDashboard";
import Informatica from "./pages/ti/Informatica";
import ProtectedRoute from "./routes/ProtectedRoute";
import api, { setAuthToken } from "./api/api";

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const crachaSalvo = localStorage.getItem("usuarioPrefHub");
    const tokenSalvo = localStorage.getItem("tokenPrefHub");
    
    if (tokenSalvo) {
      setAuthToken(tokenSalvo);
    }
    
    return crachaSalvo ? JSON.parse(crachaSalvo) : null;
  });

  useEffect(() => {
    const tempoDeInicio = Date.now();
    const tempoMinimoDesejado = 2000;

    const removerSplash = () => {
      const tempoDecorrido = Date.now() - tempoDeInicio;
      const tempoFaltante = tempoMinimoDesejado - tempoDecorrido;

      setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        if (splash) {
          splash.classList.add("esconder-splash");
          setTimeout(() => splash.remove(), 600);
        }
      }, Math.max(0, tempoFaltante));
    };

    if (document.readyState === "complete") {
      removerSplash();
    } else {
      window.addEventListener("load", removerSplash);
      return () => window.removeEventListener("load", removerSplash);
    }
  }, []);

  const handleLoginSuccess = (dadosSessao) => {
    const { usuario, token } = dadosSessao;
    setUsuarioLogado(usuario);
    localStorage.setItem("usuarioPrefHub", JSON.stringify(usuario));
    localStorage.setItem("tokenPrefHub", token);
    setAuthToken(token);
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem("usuarioPrefHub");
    localStorage.removeItem("tokenPrefHub");
    setAuthToken(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          if (!error.config.url.includes("/login")) {
            handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

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
          <Route index element={<Home usuario={usuarioLogado} />} />

          <Route
            path="almoxarifado"
            element={
              <ProtectedRoute usuario={usuarioLogado} setorExigido="Almoxarifado">
                <AlmoxarifadoDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="almoxarifado/ferramentas"
            element={
              <ProtectedRoute usuario={usuarioLogado} setorExigido="Almoxarifado">
                <Ferramentas />
              </ProtectedRoute>
            }
          />

          <Route
            path="almoxarifado/consumo"
            element={
              <ProtectedRoute usuario={usuarioLogado} setorExigido="Almoxarifado">
                <Consumo usuarioLogado={usuarioLogado} />
              </ProtectedRoute>
            }
          />

          <Route
            path="relatorios"
            element={<Relatorios usuarioLogado={usuarioLogado} />}
          />

          <Route
            path="ti"
            element={
              <ProtectedRoute usuario={usuarioLogado} setorExigido="TI">
                <TIDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="ti/informatica"
            element={
              <ProtectedRoute usuario={usuarioLogado} setorExigido="TI">
                <Informatica />
              </ProtectedRoute>
            }
          />

          <Route
            path="usuarios"
            element={
              <ProtectedRoute usuario={usuarioLogado} setorExigido="ADMIN_ONLY">
                <Usuarios />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

