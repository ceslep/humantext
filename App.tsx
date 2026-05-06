import React, { useState, useCallback, useRef, useEffect } from 'react';
import { rewriteTextStream } from './services/geminiService';
import { AppState, RewriteTone } from './types';
import { TextArea } from './components/TextArea';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [tone, setTone] = useState<RewriteTone>(RewriteTone.ACADEMIC);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const getWordCount = (text: string) => {
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
  };

  // Function 1: Pure Client-Side Cleaning (Remove Extra Spaces)
  const handleQuickClean = useCallback(() => {
    if (!inputText) return;
    // Replaces multiple whitespace with single space, trims start/end
    const cleaned = inputText.replace(/\s+/g, ' ').trim();
    setInputText(cleaned);
    setAppState(AppState.COMPLETED);
  }, [inputText]);

  // Function 2: AI Humanization & Formatting (Simultaneous Cleaning)
  const handleHumanize = useCallback(async () => {
    if (!inputText) return;
    
    // STEP 1: Immediate Client-Side Cleaning
    // Removes extra spaces from input immediately to satisfy "clean spaces" requirement visually and logically
    const cleanedInput = inputText.replace(/\s+/g, ' ').trim();
    if (cleanedInput !== inputText) {
      setInputText(cleanedInput);
    }

    setAppState(AppState.PROCESSING);
    setOutputText(''); // Clear previous output

    try {
      // STEP 2: Send cleaned text to AI for Humanization
      await rewriteTextStream(cleanedInput, tone, (chunk) => {
        setOutputText((prev) => prev + chunk);
      });
      setAppState(AppState.COMPLETED);
    } catch (error) {
      console.error("Rewrite failed", error);
      setAppState(AppState.ERROR);
      alert("Hubo un error al procesar el texto. Por favor intenta de nuevo.");
    }
  }, [inputText, tone]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Add toast notification logic here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setAppState(AppState.IDLE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Redactor<span className="text-indigo-400">Académico</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
               Anti-IA Pro
             </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
        
        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
             <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                  onClick={() => setTone(RewriteTone.ACADEMIC)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tone === RewriteTone.ACADEMIC ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Académico
                </button>
                <button 
                  onClick={() => setTone(RewriteTone.FORMAL)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tone === RewriteTone.FORMAL ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Formal
                </button>
             </div>
             <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
             <span className="text-xs text-slate-500 hidden sm:inline-block max-w-[200px]">
               Limpia espacios y humaniza en un solo click.
             </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <Button 
              variant="ghost" 
              onClick={clearAll} 
              disabled={!inputText && !outputText}
            >
              Limpiar Todo
            </Button>
            {/* The primary button now handles both tasks */}
            <Button 
              variant="primary" 
              onClick={handleHumanize}
              isLoading={appState === AppState.PROCESSING}
              disabled={!inputText}
              className="w-full sm:w-auto"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
              }
            >
              Limpiar y Humanizar
            </Button>
          </div>
        </div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-6rem)]">
          {/* Input Side */}
          <TextArea
            label="Texto Original"
            placeholder="Pega tu texto aquí. Eliminaremos los espacios extra y lo reescribiremos para que sea indetectable..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            wordCount={getWordCount(inputText)}
            onCopy={() => copyToClipboard(inputText)}
          />

          {/* Output Side */}
          <TextArea
            label="Resultado Indetectable"
            value={outputText}
            readOnly
            wordCount={getWordCount(outputText)}
            onCopy={() => copyToClipboard(outputText)}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-4 text-center border-t border-slate-800 mt-auto bg-slate-950">
        <p className="text-xs text-slate-600 max-w-4xl mx-auto px-4">
          Garantía Anti-IA: Optimizado para Copyleaks, GPTZero, ZeroGPT, Originality.ai, Scribbr, Sidekicker y Quillbot.
        </p>
      </footer>
    </div>
  );
};

export default App;