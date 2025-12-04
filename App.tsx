import React, { useState, useEffect } from 'react';
import { VideoItem } from './types';
import VideoCard from './components/VideoCard';
import AddVideoModal from './components/AddVideoModal';
import AdminLoginModal from './components/AdminLoginModal';
import SpectatorLoginModal from './components/SpectatorLoginModal';
import { Film, Plus, Search, Flame, ShieldCheck, User, Camera, Eye, Gift, X, Sparkles, Copy, Lock, Save } from 'lucide-react';

const App: React.FC = () => {
  // Initialize videos from LocalStorage if available
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const savedVideos = localStorage.getItem('paulinha_videos');
      return savedVideos ? JSON.parse(savedVideos) : [];
    } catch (error) {
      console.error("Erro ao carregar vídeos:", error);
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Start in Client Mode (false) by default for security
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Spectator Mode state (Unlock videos without Admin privileges)
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);
  
  // State for login modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSpectatorLoginOpen, setIsSpectatorLoginOpen] = useState(false);

  // Initialize Banner Image from LocalStorage
  const [bannerImage, setBannerImage] = useState<string>(() => {
    return localStorage.getItem('paulinha_banner') || "./banner-paulinha.jpg";
  });

  // Effect to save videos whenever they change
  useEffect(() => {
    localStorage.setItem('paulinha_videos', JSON.stringify(videos));
  }, [videos]);

  // Effect to save banner whenever it changes
  useEffect(() => {
    localStorage.setItem('paulinha_banner', bannerImage);
  }, [bannerImage]);

  const handleAddVideo = (newVideo: VideoItem) => {
    setVideos(prev => [newVideo, ...prev]);
  };

  const handleDeleteVideo = (id: string) => {
    if(window.confirm("Tem certeza que deseja remover este vídeo do catálogo?")) {
        setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  // Logic to switch modes
  const handleModeSwitch = () => {
    if (isAdminMode) {
      // If currently Admin, just logout to Client mode
      setIsAdminMode(false);
    } else {
      // If currently Client, open login modal
      setIsLoginOpen(true);
    }
  };

  const handleSpectatorSwitch = () => {
    if (isSpectatorMode) {
      // If currently Spectator, logout to Client mode immediately
      setIsSpectatorMode(false);
    } else {
      // If trying to become Spectator, ask for password
      setIsSpectatorLoginOpen(true);
    }
  };

  const handleSpectatorLoginSuccess = () => {
    setIsSpectatorMode(true);
    // If turning on spectator, turn off admin to avoid confusion
    if (isAdminMode) {
        setIsAdminMode(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminMode(true);
    setIsSpectatorMode(false); // Disable spectator if becoming admin
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Use FileReader to convert to Base64 for persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBannerImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-rose-950 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-rose-950/80 backdrop-blur-md border-b border-rose-900 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-pink-600 p-2 rounded-lg shadow-lg shadow-pink-600/30">
                <Flame className="w-6 h-6 text-white fill-white animate-pulse" />
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-300 to-white drop-shadow-sm">
                Paulinha Hot
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Spectator/VIP Toggle */}
              <button
                onClick={handleSpectatorSwitch}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  isSpectatorMode 
                    ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-800' 
                    : 'bg-rose-950/50 text-rose-400 border border-rose-800 hover:border-emerald-500/30 hover:text-emerald-300'
                }`}
                title={isSpectatorMode ? "Sair do VIP" : "Acessar Área VIP"}
              >
                <span className="text-sm">💎</span>
                {isSpectatorMode ? "VIP ATIVO" : "VIP"}
              </button>

              {/* Add Button - Only visible in Admin Mode (Admin button moved to footer) */}
              {isAdminMode && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-rose-900 hover:bg-pink-50 font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all text-sm shadow-lg shadow-rose-900/20 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-pink-600" />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">

        {/* Hero Banner */}
        <div className={`relative w-full h-[450px] md:h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl group transition-all duration-300 ${isAdminMode ? 'border-2 border-dashed border-pink-500/50 hover:border-pink-500' : 'border border-rose-800/50'}`}>
          
          {/* Admin Banner Upload Button */}
          {isAdminMode && (
            <div className="absolute top-4 right-4 z-30">
              <label 
                htmlFor="banner-upload" 
                className="cursor-pointer bg-pink-600 hover:bg-pink-500 text-white py-2.5 px-5 rounded-full backdrop-blur-md shadow-xl transition-all flex items-center gap-2 hover:scale-105 border border-pink-400/50"
                title="Alterar foto da capa"
              >
                <Camera className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Alterar Capa</span>
              </label>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </div>
          )}

          <img 
            src={bannerImage}
            onError={(e) => {
              // Fallback caso a pessoa ainda não tenha colocado o arquivo na pasta
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop";
            }}
            alt="Banner Paulinha" 
            className="w-full h-full object-cover object-top transition-transform duration-[10s] ease-linear group-hover:scale-110 opacity-90"
          />
          
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950 via-rose-950/20 to-transparent"></div>
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-4 text-center pointer-events-none">
             <h2 className="font-['Great_Vibes'] text-5xl md:text-7xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight animate-in fade-in slide-in-from-bottom-10 duration-1000">
               Venha me conhecer,
             </h2>
             <h2 className="font-['Great_Vibes'] text-4xl md:text-6xl text-pink-500 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-2 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
               que garanto te dar prazer
             </h2>
          </div>
        </div>
        
        {/* VIP Access Reward Button (Highly Visible) - Updated to External Link */}
        {!isAdminMode && !isSpectatorMode && (
          <div className="w-full mb-10 flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
            <button 
              onClick={() => window.open('https://pay.kiwify.com.br/2JDPGvE', '_blank')}
              className="group relative w-full md:w-auto bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white font-black uppercase tracking-widest py-5 px-10 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-yellow-200/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
              
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 z-10">
                <Gift className="w-8 h-8 text-yellow-100 animate-bounce" />
                <span className="text-xl md:text-2xl drop-shadow-md text-yellow-50">LIBERAR VIP</span>
                <Gift className="w-8 h-8 text-yellow-100 animate-bounce hidden md:block" />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-50"></div>
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-10 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-rose-400 group-focus-within:text-pink-300 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-rose-900/50 rounded-2xl leading-5 bg-rose-900/30 text-rose-100 placeholder-rose-400/50 focus:outline-none focus:bg-rose-900/50 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 sm:text-sm transition-all shadow-xl backdrop-blur-sm"
            placeholder={isAdminMode ? "Pesquisar no seu catálogo..." : "O que você quer assistir hoje?"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Video List */}
        <div className="space-y-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onDelete={handleDeleteVideo}
                isAdmin={isAdminMode}
                isSpectator={isSpectatorMode}
              />
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-rose-900 rounded-xl bg-rose-900/20">
              <div className="bg-rose-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Film className="w-10 h-10 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm ? "Nada encontrado..." : (isAdminMode ? "Sua coleção está vazia" : "Catálogo indisponível no momento")}
              </h3>
              <p className="text-rose-300/70 max-w-xs mx-auto mb-8">
                {searchTerm 
                  ? "Tente buscar por outro termo." 
                  : (isAdminMode ? "Adicione vídeos da sua galeria para os clientes verem." : "Fique atento, novidades em breve!")}
              </p>
              
              {!searchTerm && isAdminMode && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-pink-400 hover:text-pink-300 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto hover:underline decoration-2 underline-offset-4"
                >
                    Adicionar primeiro vídeo &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer (Simplified with discreet Admin link) */}
      <footer className="w-full bg-rose-950/80 border-t border-rose-900 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-rose-400/40 text-xs">
                &copy; 2024 Paulinha Hot. Todos os direitos reservados.
            </p>
            
            <div className="flex flex-col items-center gap-1">
                {/* Visual indicator of saving */}
                <span className="text-[10px] text-rose-900/50 flex items-center gap-1">
                   <Save className="w-3 h-3" /> Auto-save ativo
                </span>

                {/* Discreet Admin Toggle */}
                <button
                  onClick={handleModeSwitch}
                  className={`text-[10px] font-medium transition-all duration-300 flex items-center gap-1 px-3 py-1 rounded-full ${
                    isAdminMode 
                      ? 'text-red-400 bg-red-950/30 opacity-100' 
                      : 'text-rose-950 hover:text-rose-800 hover:bg-rose-900/20 opacity-20 hover:opacity-100'
                  }`}
                  title="Área Administrativa"
                >
                  {isAdminMode ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {isAdminMode ? "Sair do Admin" : "Admin"}
                </button>
            </div>
        </div>
      </footer>

      {/* Modals */}
      <AddVideoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddVideo} 
      />
      
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <SpectatorLoginModal
        isOpen={isSpectatorLoginOpen}
        onClose={() => setIsSpectatorLoginOpen(false)}
        onSuccess={handleSpectatorLoginSuccess}
      />
      
    </div>
  );
};

export default App;