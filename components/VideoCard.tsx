import React, { useState, useRef } from 'react';
import { VideoItem } from '../types';
import { Tag, Calendar, Trash2, Heart, MessageCircle, Share2, Bookmark, Play, Lock, X, Maximize2 } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  isSpectator?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDelete, isAdmin, isSpectator = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Admin and Spectator can both watch videos
  const canPlay = isAdmin || isSpectator;

  const handleLike = () => {
    // Toggle like state
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    // Update counter: +1 if liking, -1 if unliking
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
  };

  const handleSave = () => {
    // Toggle save state
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    const shareData: ShareData = {
      title: video.title,
      text: `Confira este vídeo no Paulinha Hot: ${video.title}`,
    };

    if (window.location.protocol.startsWith('http')) {
      shareData.url = window.location.href;
    }

    try {
      // TypeScript strict check: use typeof to avoid TS2774 error
      if (typeof navigator.share !== 'function') {
        throw new Error("Web Share API not supported");
      }

      // If canShare exists, we should use it to validate data
      if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
         throw new Error("Share data is not valid");
      }

      await navigator.share(shareData);

    } catch (error) {
      console.warn("Share API failed, falling back to clipboard:", error);
      try {
        const textToCopy = `${shareData.title}\n${shareData.text}${shareData.url ? `\n${shareData.url}` : ''}`;
        await navigator.clipboard.writeText(textToCopy);
        alert("Informações do vídeo copiadas para a área de transferência!");
      } catch (clipboardError) {
        console.error("Clipboard failed", clipboardError);
        alert("Não foi possível compartilhar este vídeo.");
      }
    }
  };

  const handleCoverClick = () => {
    if (canPlay) {
      setIsPlaying(true);
    } else {
      // Redirect to payment link in Client Mode
      window.open("https://go.tribopay.com.br/r/z06fk", "_blank");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other clicks
    onDelete(video.id);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) { /* Safari */
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) { /* IE/Edge legacy */
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="group relative bg-rose-950/40 border border-rose-900/50 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all duration-300 shadow-xl shadow-rose-900/10 mb-8 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row">
        {/* Media Section (Cover Image or Video Player) */}
        <div className={`relative w-full md:w-80 flex-shrink-0 bg-black flex items-center justify-center overflow-hidden transition-all duration-500 ${isPlaying ? 'h-96 md:h-auto' : 'h-72 md:h-auto'}`}>
          
          {!isPlaying ? (
            /* Cover Image Mode */
            <div 
              onClick={handleCoverClick}
              className="w-full h-full relative cursor-pointer group/play"
            >
              <img 
                src={video.coverUrl || "https://images.unsplash.com/photo-1608613304899-df8026bf11ea?q=80&w=600&auto=format&fit=crop"} 
                alt={video.title} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover/play:scale-110 opacity-80 ${canPlay ? 'group-hover/play:opacity-60' : 'grayscale-[0.5]'}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {canPlay ? (
                  // Play Button for Admin or Spectator
                  <div className={`bg-pink-600/90 rounded-full p-4 shadow-lg shadow-pink-600/40 transform group-hover/play:scale-110 transition-transform duration-300 ${isSpectator ? 'bg-emerald-600/90 shadow-emerald-600/40' : ''}`}>
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </div>
                ) : (
                  // Lock Icon for Client
                  <div className="bg-rose-950/90 border border-rose-500/30 rounded-full p-5 shadow-2xl shadow-black transform group-hover/play:scale-105 transition-transform duration-300 flex flex-col items-center">
                    <Lock className="w-8 h-8 text-rose-400 mb-1" />
                    <span className="text-sm uppercase font-bold text-rose-200 tracking-wider mt-1">Bloqueado</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Video Player Mode (Only reachable by Admin or Spectator) */
            <div className="w-full h-full relative group/player bg-black">
                <video 
                  ref={videoRef}
                  src={video.url} 
                  autoPlay
                  controls 
                  playsInline
                  poster={video.coverUrl}
                  className="w-full h-full object-contain"
                  controlsList="nodownload"
                />
                
                {/* Fullscreen Button */}
                <button 
                    onClick={handleFullscreen}
                    className="absolute top-2 right-12 bg-black/60 hover:bg-pink-600 text-white p-1.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/player:opacity-100 z-10 mr-1"
                    title="Tela Cheia"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>

                {/* Close Player Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(false);
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 text-white p-1.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/player:opacity-100 z-10"
                    title="Fechar vídeo"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col justify-between w-full">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="text-2xl font-bold text-pink-50 line-clamp-2 group-hover:text-pink-400 transition-colors drop-shadow-sm">
                {video.title}
                </h3>
                
                {/* Delete button only visible for Admin (Not spectator) */}
                {isAdmin && (
                  <button 
                      onClick={handleDelete}
                      className="flex items-center gap-2 bg-rose-950/50 hover:bg-red-900/80 text-rose-400 hover:text-red-200 border border-rose-900 hover:border-red-700 transition-all py-1.5 px-3 rounded-lg shadow-sm group/delete flex-shrink-0"
                      title="Remover vídeo do catálogo"
                  >
                      <Trash2 className="w-4 h-4 group-hover/delete:animate-bounce" />
                      <span className="text-xs font-bold uppercase tracking-wide">Excluir</span>
                  </button>
                )}
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-rose-900/50 pt-4">
              <div className="flex gap-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 transition-colors group/like ${isLiked ? 'text-pink-500' : 'text-rose-300 hover:text-pink-400'}`}
                >
                  <Heart className={`w-6 h-6 transition-transform group-active/like:scale-75 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{likeCount.toLocaleString()}</span>
                </button>
                
                {/* Comment Button - Only visible for Admin */}
                {isAdmin && (
                  <button className="flex items-center gap-1.5 text-rose-300 hover:text-pink-400 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-medium">{video.comments}</span>
                  </button>
                )}

                <button 
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-rose-300 hover:text-pink-400 transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              <button 
                onClick={handleSave}
                className={`transition-colors group/save ${isSaved ? 'text-pink-500' : 'text-rose-300 hover:text-pink-400'}`}
                title={isSaved ? "Salvo" : "Salvar"}
              >
                <Bookmark className={`w-6 h-6 transition-transform group-active/save:scale-90 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Tags & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {/* Tags - Only visible for Admin */}
                {isAdmin && video.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-900/40 text-pink-300 border border-pink-800/50">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-rose-400/60 ml-auto">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;