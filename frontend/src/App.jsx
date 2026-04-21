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

// ========================================================
// TELA INICIAL (DASHBOARD GERAL)
// ========================================================
function TelaInicial({ usuario }) {
  // Lista de curiosidades para engajar o servidor
  const curiosidades = [
    "Iguatama é carinhosamente conhecida como a 'Terra de Futuro e Grandeza'.",
    "A Ponte sobre o Rio São Francisco é um dos maiores símbolos históricos da nossa cidade.",
    "O município possui forte tradição no agronegócio e uma hospitalidade ímpar.",
    "Beba água e lembre-se: a segurança no trabalho constrói uma cidade melhor para todos.",
    "A união de todos os setores é o que faz a Prefeitura de Iguatama ser forte e eficiente.",
  ];

  // Sorteia uma frase diferente toda vez que abre
  const curiosidadeDoDia =
    curiosidades[Math.floor(Math.random() * curiosidades.length)];

  // Pega só o primeiro nome da pessoa para ficar amigável
  const primeiroNome = usuario?.nome ? usuario.nome.split(" ")[0] : "Servidor";

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden rounded-xl border border-slate-200 shadow-sm min-h-[60vh]">
      {/* Imagem de Fundo (Padrão Geométrico Sutil) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center flex-1">
        {/* Logo Redonda na Tela Inicial */}
        <div className="w-24 h-24 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center mb-6 p-2">
          <img
            src="/logo-circular.png"
            alt="Iguatama"
            className="w-full h-full object-contain opacity-90"
          />
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Olá, {primeiroNome}!
        </h1>

        <p className="text-slate-500 mb-8 max-w-md text-sm">
          Selecione uma ferramenta operacional na barra de navegação para
          iniciar seus trabalhos de hoje.
        </p>

        {/* Card de Curiosidade */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 max-w-md mt-auto shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-extrabold text-blue-800 uppercase mb-2 tracking-wider flex items-center justify-center gap-2">
            💡 Você Sabia?
          </p>
          <p className="text-sm text-blue-900/80 font-medium italic">
            "{curiosidadeDoDia}"
          </p>
        </div>
      </div>
    </div>
  );
}

// ... (mantenha os imports e a função TelaInicial e RotaProtegida iguais)

// ========================================================
// APLICATIVO PRINCIPAL E GERENCIADOR DE ESTADO
// ========================================================
export default function App() {
  // ================= A MÁGICA DA MEMÓRIA =================
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const crachaSalvo = localStorage.getItem("usuarioPrefHub");
    return crachaSalvo ? JSON.parse(crachaSalvo) : null;
  });

  // ================= CONTROLE INTELIGENTE DA SPLASH SCREEN =================
  useEffect(() => {
    // 1. O React começou a rodar! Marcamos o momento exato.
    const tempoDeInicio = Date.now();
    const tempoMinimoDesejado = 2000; // 2 Segundos

    // 2. Criamos a função que vai esconder a tela azul
    const removerSplash = () => {
      const tempoDecorrido = Date.now() - tempoDeInicio;
      const tempoFaltante = tempoMinimoDesejado - tempoDecorrido;

      // Se o React carregou muito rápido (ex: 500ms), ele espera os 1500ms restantes
      // Se demorou muito (ex: 3000ms), tempoFaltante será negativo e o setTimeout roda na hora (0)
      setTimeout(
        () => {
          const splash = document.getElementById("splash-screen");
          if (splash) {
            splash.classList.add("esconder-splash");
            // Depois de esconder suavemente, removemos do HTML para poupar memória do celular
            setTimeout(() => splash.remove(), 600);
          }
        },
        Math.max(0, tempoFaltante),
      );
    };

    // 3. Verifica se a janela (DOM) já terminou de carregar os componentes
    if (document.readyState === "complete") {
      removerSplash();
    } else {
      window.addEventListener("load", removerSplash);
      return () => window.removeEventListener("load", removerSplash);
    }
  }, []); // O array vazio garante que isso rode apenas 1 vez quando o App abrir

  // ================= FUNÇÕES DE LOGIN/LOGOUT =================
  const handleLoginSuccess = (dadosUsuario) => {
    setUsuarioLogado(dadosUsuario);
    localStorage.setItem("usuarioPrefHub", JSON.stringify(dadosUsuario));
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem("usuarioPrefHub");
  };

  // ================= RENDERIZAÇÃO DAS TELAS =================
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
          <Route index element={<TelaInicial usuario={usuarioLogado} />} />

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
