/**
 * @file AlmoxarifadoDashboard.jsx
 * @description Dashboard principal do módulo de Almoxarifado.
 * Atua como um menu centralizador para todas as ferramentas pertencentes a este setor.
 * @module Frontend/Pages/Almoxarifado/Dashboard
 */

import { Wrench, Shield, Droplets } from "lucide-react";
import ModuleDashboard from "../../components/ModuleDashboard";

export default function AlmoxarifadoDashboard() {
  const miniApps = [
    {
      titulo: "Controle de Ferramentas",
      descricao: "Gestão de estoque, empréstimos e devoluções.",
      icone: Wrench,
      cor: "bg-blue-600",
      link: "/almoxarifado/ferramentas",
      disponivel: true,
    },
    {
      titulo: "Controle de EPIs",
      descricao: "Distribuição e cautela de equipamentos de proteção.",
      icone: Shield,
      cor: "bg-emerald-600",
      link: "#",
      disponivel: false,
    },
    {
      titulo: "Materiais de Limpeza",
      descricao: "Gestão de requisições de consumo por setor interno.",
      icone: Droplets,
      cor: "bg-cyan-600",
      link: "#",
      disponivel: false,
    },
  ];

  return (
    <ModuleDashboard 
      setor="Almoxarifado Central" 
      apps={miniApps} 
    />
  );
}
