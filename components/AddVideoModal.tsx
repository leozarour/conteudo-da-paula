import React, { useState } from 'react';
import { X, Sparkles, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { VideoItem } from '../types';
import { generateVideoMetadata } from '../services/geminiService';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (video: VideoItem) => void;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  // Description state removed as it is no longer user-editable or displayed
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setVideoFile(selectedFile);
      // Auto-fill title if empty
      if (!title) {
        const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) return;

    setLoading(true);
    
    // Call Gemini to get smart data (Tags) and summary
    const aiData = await generateVideoMetadata(title, videoFile.name);

    // Create local URLs
    const videoUrl = URL.createObjectURL(videoFile);
    // Use a placeholder if no cover is selected, or the selected cover
    const coverUrl = coverFile 
      ? URL.createObjectURL(coverFile) 
      : "https://images.unsplash.com/photo-1608613304899-df8026bf11ea?q=80&w=600&auto=format&fit=crop"; 

    // Generate high engagement numbers > 2000
    const randomLikes = Math.floor(Math.random() * 5000) + 2150; // Between 2150 and 7150

    const newVideo: VideoItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      url: videoUrl,
      coverUrl: coverUrl,
      description: aiData.summary, // Kept in data structure but not displayed
      tags: aiData.tags, 
      createdAt: Date.now(),
      likes: randomLikes,
      comments: Math.floor(Math.random() * 100) + 20,
      shares: Math.floor(Math.random() * 200) + 50,
    };

    onAdd(newVideo);
    setLoading(false);
    setTitle('');
    setVideoFile(null);
    setCoverFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-rose-950 border border-rose-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-rose-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Adicionar Vídeo Hot
          </h2>
          <p className="text-rose-200/70 text-sm mt-1">
            Preencha os dados abaixo para o catálogo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-rose-200 mb-2">
              1. Arquivo de Vídeo
            </label>
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="video-upload"
                required
              />
              <label 
                htmlFor="video-upload"
                className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  videoFile ? 'border-pink-500 bg-pink-500/10' : 'border-rose-800 hover:border-rose-600 hover:bg-rose-900'
                }`}
              >
                <div className="text-center">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${videoFile ? 'text-pink-400' : 'text-rose-500'}`} />
                    <span className={`text-sm ${videoFile ? 'text-pink-200' : 'text-rose-400'}`}>
                        {videoFile ? videoFile.name : 'Selecionar Vídeo'}
                    </span>
                </div>
              </label>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-rose-200 mb-2">
              2. Capa do Vídeo (Thumbnail)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <label 
                htmlFor="cover-upload"
                className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  coverFile ? 'border-pink-500 bg-pink-500/10' : 'border-rose-800 hover:border-rose-600 hover:bg-rose-900'
                }`}
              >
                <div className="text-center flex items-center justify-center gap-3">
                    <ImageIcon className={`w-6 h-6 ${coverFile ? 'text-pink-400' : 'text-rose-500'}`} />
                    <span className={`text-sm ${coverFile ? 'text-pink-200' : 'text-rose-400'}`}>
                        {coverFile ? coverFile.name : 'Selecionar Imagem de Capa'}
                    </span>
                </div>
              </label>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-rose-200 mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Noite Inesquecível"
              className="w-full bg-rose-900/50 border border-rose-800 rounded-lg px-4 py-3 text-white placeholder-rose-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !videoFile}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Catálogo...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Salvar Vídeo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoModal;