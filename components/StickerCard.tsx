
import React from 'react';
import { Download, Trash2, Edit2 } from 'lucide-react';
import { Sticker } from '../types';

interface StickerCardProps {
  sticker: Sticker;
  onDelete: (id: string) => void;
  onEdit: (sticker: Sticker) => void;
}

export const StickerCard: React.FC<StickerCardProps> = ({ sticker, onDelete, onEdit }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = sticker.url;
    link.download = `sticker-${sticker.prompt.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative bg-[#FFFBF5] rounded-[2rem] border border-[#3D3721]/5 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="aspect-square bg-[radial-gradient(#F85E00_0.5px,transparent_0.5px)] [background-size:20px_20px] bg-white flex items-center justify-center p-6 relative">
        <img 
          src={sticker.url} 
          alt={sticker.prompt}
          className="w-full h-full object-contain sticker-border z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFFBF5]/40 to-transparent opacity-50"></div>
      </div>
      
      <div className="p-4 bg-white/60 border-t border-[#3D3721]/5">
        <p className="text-[10px] font-black text-[#3D3721] uppercase tracking-widest mb-3 truncate px-1 opacity-90">
          {sticker.prompt}
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(sticker)}
            className="flex-1 flex justify-center py-2.5 rounded-xl bg-white text-[#3D3721] hover:bg-[#F85E00] hover:text-white transition-all duration-300 shadow-sm border border-[#3D3721]/5"
            title="編輯貼圖"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 flex justify-center py-2.5 rounded-xl bg-white text-[#3D3721] hover:bg-[#F85E00] hover:text-white transition-all duration-300 shadow-sm border border-[#3D3721]/5"
            title="下載"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(sticker.id)}
            className="flex-1 flex justify-center py-2.5 rounded-xl bg-white text-[#3D3721] hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm border border-[#3D3721]/5"
            title="刪除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
