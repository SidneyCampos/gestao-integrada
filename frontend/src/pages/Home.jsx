/**
 * @file Home.jsx
 * @description Dashboard geral exibido após o login.
 */
import React from 'react';

export default function Home({ usuario }) {
  const curiosidades = [
    "Iguatama é carinhosamente conhecida como a 'Terra de Futuro e Grandeza'.",
    "A Ponte sobre o Rio São Francisco é um dos maiores símbolos históricos da nossa cidade.",
    "O município possui forte tradição no agronegócio e uma hospitalidade ímpar.",
    "Beba água e lembre-se: a segurança no trabalho constrói uma cidade melhor para todos.",
    "A união de todos os setores é o que faz a Prefeitura de Iguatama ser forte e eficiente.",
  ];

  const curiosidadeDoDia = curiosidades[Math.floor(Math.random() * curiosidades.length)];
  const primeiroNome = usuario?.nome ? usuario.nome.split(" ")[0] : "Servidor";

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden rounded-xl border border-slate-200 shadow-sm min-h-[60vh]">
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center flex-1">
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
