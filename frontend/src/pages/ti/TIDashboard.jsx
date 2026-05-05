/**
 * @file TIDashboard.jsx
 * @description Dashboard principal do módulo de TI.
 * @module Frontend/Pages/TI/Dashboard
 */

import { Cpu, Laptop, Server, Wifi } from "lucide-react";
import ModuleDashboard from "../../components/ModuleDashboard";

export default function TIDashboard() {
  const miniApps = [
    {
      titulo: "Almoxarifado de TI",
      descricao: "Gestão de toners, peças e periféricos da informática.",
      icone: Cpu,
      cor: "bg-indigo-600",
      link: "/ti/informatica",
      disponivel: true,
    },
    {
      titulo: "Gestão de Ativos",
      descricao: "Controle de computadores, monitores e equipamentos de rede.",
      icone: Laptop,
      cor: "bg-slate-700",
      link: "#",
      disponivel: false,
    },
    {
      titulo: "Infraestrutura & Redes",
      descricao: "Mapa de pontos de rede e servidores da prefeitura.",
      icone: Server,
      cor: "bg-orange-600",
      link: "#",
      disponivel: false,
    },
    {
      titulo: "Suporte Técnico",
      descricao: "Abertura e acompanhamento de chamados internos.",
      icone: Wifi,
      cor: "bg-blue-500",
      link: "#",
      disponivel: false,
    },
  ];

  return (
    <ModuleDashboard 
      setor="Tecnologia da Informação" 
      subtitulo="Gerencie a infraestrutura e os recursos tecnológicos da prefeitura."
      apps={miniApps} 
    />
  );
}
