import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AlmoxarifadoDashboard from "./pages/almoxarifado/AlmoxarifadoDashboard";

// Uma tela inicial genérica apenas para não ficar vazio quando logar
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

// Uma tela temporária para onde a rota de ferramentas vai apontar hoje
function TelaFerramentasTemp() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-slate-800 animate-pulse">
        🚧 Construindo Tabela de Ferramentas de Alta Densidade...
      </h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TelaInicial />} />

          {/* Rota do Painel Hub do Almoxarifado */}
          <Route path="almoxarifado" element={<AlmoxarifadoDashboard />} />

          {/* Rota ESPECÍFICA para a aplicação de Controle de Ferramentas */}
          <Route
            path="almoxarifado/ferramentas"
            element={<TelaFerramentasTemp />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
