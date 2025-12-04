import React, { useState } from 'react';
import { X, Eye, KeyRound, ChevronRight } from 'lucide-react';

interface SpectatorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SpectatorLoginModal: React.FC<SpectatorLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha solicitada: "prazer ilimitado"
    // Adicionei .trim() e .toLowerCase() para evitar erros se o usuário der espaço extra sem querer
    if (password.trim().toLowerCase() === 'prazer ilimitado') {
      onSuccess();
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-emerald-900 border border-emerald-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-emerald-950 p-4 rounded-full border border-emerald-500/20 mb-4 shadow-inner shadow-black/50">
            <Eye className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Área VIP</h2>
          <p className="text-emerald-300/60 text-sm mt-1">
            Digite a senha secreta para liberar o acesso VIP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className={`h-5 w-5 ${error ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-black/20 text-white placeholder-emerald-500/30 focus:outline-none focus:ring-2 transition-all ${
                error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-emerald-800 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
              placeholder="Senha VIP"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center font-medium animate-pulse">
              Senha incorreta.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 mt-2"
          >
            Liberar Acesso
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SpectatorLoginModal;