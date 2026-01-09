
import React from 'react';
import { Sparkles, Sticker as StickerIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#FFFBF5]/95 backdrop-blur-md border-b border-[#3D3721]/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#F85E00] p-2 rounded-2xl shadow-lg shadow-[#F85E00]/20">
            <StickerIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="title-font text-2xl leading-none text-[#3D3721]">AI 貼圖創作家</h1>
            <p className="text-[10px] text-[#3D3721]/70 font-black uppercase tracking-widest mt-1">繁體中文版 • Sunlight Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#3D3721] bg-white/60 px-4 py-1.5 rounded-full border border-[#3D3721]/20">
          <Sparkles className="w-4 h-4 text-[#F85E00] animate-pulse" />
          <span className="text-xs font-black tracking-wider">青春活力</span>
        </div>
      </div>
    </header>
  );
};
