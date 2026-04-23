/**
 * @file ModuleDashboard.jsx
 * @description Componente genérico para renderizar o dashboard de um setor.
 * Padroniza a exibição de "mini-aplicativos" ou serviços disponíveis dentro de um módulo.
 * @module Frontend/Components/ModuleDashboard
 */

import { Link } from "react-router-dom";

/**
 * @param {Object} props
 * @param {string} props.setor - Nome do setor (ex: "Almoxarifado")
 * @param {string} props.subtitulo - Frase de efeito ou instrução
 * @param {Array} props.apps - Lista de objetos { titulo, descricao, icone, cor, link, disponivel }
 */
export default function ModuleDashboard({ setor, subtitulo, apps }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Setor: {setor}
        </h1>
        <p className="text-slate-500 mt-1">
          {subtitulo || "Selecione a ferramenta de gestão que deseja acessar."}
        </p>
      </div>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app, index) => (
          <Link
            key={index}
            to={app.link}
            className={`relative p-6 bg-white rounded-xl border border-slate-200 transition-all duration-200 
              ${
                app.disponivel
                  ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            onClick={(e) => !app.disponivel && e.preventDefault()}
          >
            {/* Ícone Colorido */}
            <div
              className={`w-12 h-12 rounded-lg ${app.cor} text-white flex items-center justify-center mb-4 shadow-sm`}
            >
              <app.icone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {app.titulo}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {app.descricao}
            </p>

            {/* Etiqueta 'Em Breve' */}
            {!app.disponivel && (
              <span className="absolute top-6 right-6 text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider">
                Em breve
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
