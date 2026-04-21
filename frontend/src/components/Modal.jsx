/**
 * @file Modal.jsx
 * @description Componente de Modal reutilizável com animações e acessibilidade básica.
 * Centraliza o estilo visual e o comportamento de fechamento.
 * @module Frontend/Components/Modal
 */

import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, footer, variant = "primary" }) {
  if (!isOpen) return null;

  // Define as cores do cabeçalho baseada na variante
  const headerStyles = {
    primary: "bg-slate-50 text-slate-800",
    blue: "bg-blue-600 text-white",
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${headerStyles[variant]}`}>
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${variant === 'blue' ? 'text-white/70 hover:text-white hover:bg-blue-700' : 'text-slate-400 hover:bg-slate-200'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6">
          {children}
        </div>

        {/* Rodapé Opcional */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

      {/* Camada de clique externo para fechar */}
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
