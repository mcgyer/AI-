
import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { StickerCard } from './components/StickerCard';
import { StickerEditor } from './components/StickerEditor';
import { generateSticker } from './services/geminiService';
import { Sticker, StickerExpression } from './types';
import { 
  Upload, 
  Plus, 
  Loader2, 
  AlertCircle, 
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Zap,
  Type
} from 'lucide-react';

const App: React.FC = () => {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpression, setSelectedExpression] = useState<StickerExpression>(StickerExpression.HAPPY);
  const [customPrompt, setCustomPrompt] = useState('');
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!baseImage) {
      setError("請先上傳基礎角色圖片。");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const stickerUrl = await generateSticker(baseImage, selectedExpression, customPrompt);
      if (stickerUrl) {
        const newSticker: Sticker = {
          id: Math.random().toString(36).substring(7),
          url: stickerUrl,
          prompt: customPrompt || selectedExpression,
          timestamp: Date.now(),
        };
        setStickers(prev => [newSticker, ...prev]);
        setCustomPrompt('');
      } else {
        throw new Error("AI 無法回傳圖片。");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "產生貼圖失敗。請檢查 API Key 或網路連線。");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveEditedSticker = (id: string, newUrl: string) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, url: newUrl } : s));
    setEditingSticker(null);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#FFF5E6]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Creation Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Base Image Section */}
            <section className="bg-[#FFFBF5] p-6 rounded-3xl border border-[#3D3721]/10 shadow-xl shadow-black/5">
              <h2 className="text-lg font-black text-[#3D3721] mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#F85E00]" />
                1. 角色設定
              </h2>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  baseImage ? 'border-[#F85E00]/30 bg-white/20' : 'border-[#3D3721]/10 hover:border-[#F85E00] hover:bg-white/40'
                }`}
              >
                {baseImage ? (
                  <img src={baseImage} alt="Base" className="w-full h-full object-contain rounded-2xl p-2" />
                ) : (
                  <div className="text-center p-6">
                    <div className="bg-white/60 p-4 rounded-full inline-block mb-3 text-[#F85E00]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#3D3721]">上傳角色圖片</p>
                    <p className="text-xs text-[#3D3721]/60 mt-1">上傳後即可開始自動去背生成</p>
                  </div>
                )}
                
                {baseImage && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                    <p className="text-white bg-[#F85E00] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">更換圖片</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>
            </section>

            {/* Expression Selection Section */}
            <section className="bg-[#FFFBF5] p-6 rounded-3xl border border-[#3D3721]/10 shadow-xl shadow-black/5">
              <h2 className="text-lg font-black text-[#3D3721] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F85E00]" />
                2. 選擇表情
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.values(StickerExpression).map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setSelectedExpression(exp)}
                    className={`text-xs font-bold px-3 py-3 rounded-xl border transition-all text-left truncate ${
                      selectedExpression === exp 
                        ? 'bg-[#F85E00] border-[#F85E00] text-white shadow-lg shadow-[#F85E00]/30 scale-[1.02]' 
                        : 'bg-white border-[#3D3721]/10 text-[#3D3721] hover:bg-white hover:border-[#F85E00]/40'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-xs font-bold text-[#3D3721] uppercase tracking-wider mb-2 italic opacity-60">自訂額外要求 (選填)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="例如：穿著一件紅色連帽衫..."
                  className="w-full px-4 py-3 bg-white border border-[#3D3721]/10 rounded-2xl text-sm font-medium text-[#3D3721] focus:ring-4 focus:ring-[#F85E00]/10 focus:border-[#F85E00] outline-none transition-all placeholder:text-[#3D3721]/30"
                  rows={2}
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100/50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                disabled={!baseImage || isGenerating}
                onClick={handleGenerate}
                className={`mt-6 w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.97] ${
                  !baseImage || isGenerating
                    ? 'bg-white/30 text-[#3D3721]/30 cursor-not-allowed shadow-none'
                    : 'bg-[#F85E00] text-white hover:bg-[#D45000] shadow-[#F85E00]/30'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在生成去背貼圖...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    生成貼圖
                  </>
                )}
              </button>
              <p className="text-[10px] text-center mt-3 text-[#3D3721]/50 font-bold">
                * 貼圖將不帶文字，可於生成後手動加入
              </p>
            </section>
          </div>

          {/* Right Side: Sticker Gallery */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-[#3D3721]">我的專屬貼圖</h2>
                <span className="bg-[#F85E00] text-white px-3 py-1 rounded-full text-sm font-black shadow-md shadow-[#F85E00]/20">
                  {stickers.length}
                </span>
              </div>
              {stickers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#3D3721]/70 font-bold hidden sm:flex italic">
                  <Type className="w-4 h-4 text-[#F85E00]" />
                  點擊編輯，自行加入台灣味流行語！
                </div>
              )}
            </div>

            {stickers.length === 0 ? (
              <div className="bg-[#FFFBF5] border-4 border-dashed border-[#3D3721]/10 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center shadow-2xl shadow-black/5">
                <div className="bg-white p-8 rounded-full mb-6 relative text-[#F85E00] shadow-sm">
                  <Plus className="w-12 h-12" />
                  <div className="absolute -top-2 -right-2 bg-[#F85E00] p-2 rounded-full animate-bounce shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-[#3D3721] mb-2">啟動你的貼圖創意</h3>
                <p className="text-[#3D3721]/60 font-medium max-w-xs mx-auto">
                  上傳角色，AI 將生成去背圖。隨後點擊編輯按鈕，即可自由添加任何流行對白！
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {stickers.map(sticker => (
                  <StickerCard 
                    key={sticker.id} 
                    sticker={sticker} 
                    onDelete={deleteSticker} 
                    onEdit={setEditingSticker}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Editing Modal */}
      {editingSticker && (
        <StickerEditor 
          sticker={editingSticker}
          onClose={() => setEditingSticker(null)}
          onSave={handleSaveEditedSticker}
        />
      )}
    </div>
  );
};

export default App;
