import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, footer, variant = "primary", width = "max-w-md" }) {
  if (!isOpen) return null;

  // Define as cores do cabeçalho baseada na variante
  const headerStyles = {
    primary: "bg-slate-50 text-slate-800",
    blue: "bg-blue-600 text-white",
    cyan: "bg-cyan-600 text-white",
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full ${width} overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${headerStyles[variant] || headerStyles.primary}`}>
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${variant === 'primary' ? 'text-slate-400 hover:bg-slate-200' : 'text-white/70 hover:text-white hover:bg-black/10'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto flex-1">
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
