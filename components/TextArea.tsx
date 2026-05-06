import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  wordCount?: number;
  onCopy?: () => void;
  readOnly?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  wordCount = 0, 
  onCopy, 
  className = '', 
  readOnly,
  ...props 
}) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-2 px-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">{wordCount} palabras</span>
          {onCopy && (
            <button 
              onClick={onCopy} 
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              title="Copiar al portapapeles"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copiar
            </button>
          )}
        </div>
      </div>
      <div className={`flex-grow relative rounded-xl border transition-all duration-300 overflow-hidden group
        ${readOnly 
          ? 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500'
        }`}
      >
        <textarea
          className={`w-full h-full p-5 bg-transparent resize-none outline-none font-serif text-lg leading-relaxed
            ${readOnly ? 'text-slate-300' : 'text-slate-100 placeholder-slate-500'}`}
          spellCheck={false}
          readOnly={readOnly}
          {...props}
        />
        {readOnly && !props.value && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none">
            <span className="text-sm">El resultado aparecerá aquí...</span>
          </div>
        )}
      </div>
    </div>
  );
};