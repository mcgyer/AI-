
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  Type, 
  Pencil, 
  Sun, 
  Contrast, 
  Palette, 
  RotateCcw,
  Undo2,
  Move,
  Type as TypeIcon
} from 'lucide-react';
import { Sticker } from '../types';

interface StickerEditorProps {
  sticker: Sticker;
  onSave: (id: string, newUrl: string) => void;
  onClose: () => void;
}

export const StickerEditor: React.FC<StickerEditorProps> = ({ sticker, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<'draw' | 'text' | 'filter'>('draw');
  const [color, setColor] = useState('#F85E00'); 
  const [brushSize, setBrushSize] = useState(8);
  const [text, setText] = useState('');
  const [textSize, setTextSize] = useState(70);
  const [textPos, setTextPos] = useState({ x: 50, y: 85 }); // 百分比位置
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sticker.url;
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 800;
      applyFiltersAndDraw(img);
      saveToHistory();
    };
  }, [sticker.url]);

  const applyFiltersAndDraw = (img: HTMLImageElement | HTMLCanvasElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除畫布，保留透明
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev, canvas.toDataURL('image/png')]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = previousState;
      img.onload = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);
      };
    }
  };

  const handleCanvasInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'draw') {
      startDrawing(e);
    } else if (tool === 'text') {
      updateTextPositionFromEvent(e);
    }
  };

  const updateTextPositionFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setTextPos({ x, y });
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const addTextOverlay = () => {
    if (!text) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const targetX = (textPos.x / 100) * canvas.width;
    const targetY = (textPos.y / 100) * canvas.height;

    ctx.font = `bold ${textSize}px "Noto Sans TC", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    
    // 描邊效果
    ctx.strokeStyle = 'white';
    ctx.lineWidth = textSize / 6;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, targetX, targetY);
    
    // 文字陰影
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText(text, targetX, targetY);
    
    // 重設狀態
    ctx.shadowBlur = 0;
    setText('');
    saveToHistory();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // 確保儲存為透明 PNG
      onSave(sticker.id, canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#3D3721]/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#FFFBF5]">
        
        {/* Left: Toolbar */}
        <div className="w-full md:w-24 bg-[#FFFBF5] border-r border-[#3D3721]/10 p-4 flex flex-row md:flex-col gap-4 items-center">
          <button 
            onClick={() => setTool('draw')}
            className={`p-4 rounded-2xl transition-all ${tool === 'draw' ? 'bg-[#F85E00] text-white shadow-lg scale-110' : 'text-[#3D3721] hover:bg-white/60'}`}
            title="畫筆工具"
          >
            <Pencil className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setTool('text')}
            className={`p-4 rounded-2xl transition-all ${tool === 'text' ? 'bg-[#F85E00] text-white shadow-lg scale-110' : 'text-[#3D3721] hover:bg-white/60'}`}
            title="文字工具"
          >
            <Type className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setTool('filter')}
            className={`p-4 rounded-2xl transition-all ${tool === 'filter' ? 'bg-[#F85E00] text-white shadow-lg scale-110' : 'text-[#3D3721] hover:bg-white/60'}`}
            title="濾鏡調整"
          >
            <Palette className="w-6 h-6" />
          </button>
          <div className="flex-grow" />
          <button 
            onClick={undo}
            className="p-4 rounded-2xl text-[#3D3721]/40 hover:bg-white/60 transition-all hover:text-[#3D3721]"
            title="復原"
          >
            <Undo2 className="w-6 h-6" />
          </button>
          <button 
            onClick={onClose}
            className="p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all mt-auto"
            title="關閉"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Canvas Area */}
        <div className="flex-grow bg-[#FFF5E6]/30 flex items-center justify-center p-8 relative overflow-hidden">
          <div 
            ref={containerRef}
            className="relative shadow-2xl rounded-3xl overflow-hidden bg-white border-8 border-white select-none"
            style={{ 
              width: 'min(550px, 75vw)', 
              height: 'min(550px, 75vw)',
              // 加入棋盤格底紋提示透明
              backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            <canvas 
              ref={canvasRef}
              onMouseDown={handleCanvasInteraction}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleCanvasInteraction}
              onTouchMove={(e) => tool === 'draw' ? draw(e) : updateTextPositionFromEvent(e)}
              onTouchEnd={stopDrawing}
              className={`w-full h-full object-contain relative z-10 ${tool === 'draw' ? 'cursor-crosshair' : tool === 'text' ? 'cursor-move' : 'cursor-default'}`}
            />
            
            {/* 文字預覽 */}
            {tool === 'text' && text && (
              <div 
                className="absolute pointer-events-none whitespace-nowrap font-bold flex items-center justify-center transition-all duration-75"
                style={{ 
                  left: `${textPos.x}%`, 
                  top: `${textPos.y}%`, 
                  transform: 'translate(-50%, -50%)',
                  color: color,
                  textShadow: '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 4px 8px rgba(0,0,0,0.3)',
                  zIndex: 50,
                  fontSize: `${(textSize * (containerRef.current?.offsetWidth || 550) / 800)}px`
                }}
              >
                {text}
              </div>
            )}

            {/* 位置提示器 */}
            {tool === 'text' && (
              <div 
                className="absolute w-6 h-6 border-2 border-[#F85E00] rounded-full pointer-events-none flex items-center justify-center bg-white/50 shadow-sm transition-all duration-75"
                style={{ 
                  left: `${textPos.x}%`, 
                  top: `${textPos.y}%`, 
                  transform: 'translate(-50%, -50%)',
                  zIndex: 60
                }}
              >
                <div className="w-1 h-1 bg-[#F85E00] rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Right: Settings Bar */}
        <div className="w-full md:w-80 bg-white border-l border-[#FFFBF5] p-8 flex flex-col gap-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#3D3721] uppercase text-xs tracking-[0.2em] italic">創意工作室</h3>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#F85E00] text-white px-5 py-2.5 rounded-full font-black text-sm shadow-xl shadow-[#F85E00]/10 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> 儲存
            </button>
          </div>

          {tool === 'draw' && (
            <div className="space-y-6">
              <label className="block text-xs font-black text-[#3D3721] uppercase tracking-widest opacity-60">畫筆調色盤</label>
              <div className="grid grid-cols-5 gap-3">
                {['#F85E00', '#FFB563', '#3D3721', '#000000', '#ffffff', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-4 transition-transform ${color === c ? 'border-[#F85E00] scale-125 z-10' : 'border-transparent shadow-sm'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="pt-4">
                <label className="block text-xs font-black text-[#3D3721] uppercase tracking-widest mb-4 opacity-60">畫筆粗細</label>
                <input 
                  type="range" min="1" max="60" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-[#F85E00]"
                />
              </div>
            </div>
          )}

          {tool === 'text' && (
            <div className="space-y-6">
              <label className="block text-xs font-black text-[#3D3721] uppercase tracking-widest opacity-60">自訂對白</label>
              <input 
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="輸入活力台詞..."
                className="w-full px-5 py-4 bg-[#FFF5E6]/30 border-2 border-[#FFFBF5] rounded-2xl text-sm font-bold text-[#3D3721] outline-none focus:border-[#F85E00] focus:bg-white transition-all placeholder:text-[#3D3721]/30"
              />
              
              <div className="space-y-4 pt-2 border-b border-[#3D3721]/5 pb-6">
                <div className="flex items-center gap-2 text-[#3D3721]/60">
                   <TypeIcon className="w-4 h-4" />
                   <label className="text-xs font-black uppercase tracking-widest">調整大小</label>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-[#3D3721]/50">
                    <span>字體大小</span>
                    <span>{textSize}px</span>
                  </div>
                  <input 
                    type="range" min="20" max="200" 
                    value={textSize} 
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="w-full accent-[#F85E00]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-[#3D3721]/60">
                   <Move className="w-4 h-4" />
                   <label className="text-xs font-black uppercase tracking-widest">調整位置</label>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-[#3D3721]/50">
                    <span>水平位置</span>
                    <span>{Math.round(textPos.x)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={textPos.x} 
                    onChange={(e) => setTextPos(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-full accent-[#F85E00]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-[#3D3721]/50">
                    <span>垂直位置</span>
                    <span>{Math.round(textPos.y)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={textPos.y} 
                    onChange={(e) => setTextPos(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-full accent-[#F85E00]"
                  />
                </div>
                <p className="text-[10px] text-[#3D3721]/40 text-center italic">提示：可直接點擊圖片更改位置</p>
              </div>

              <div className="pt-4">
                <label className="block text-xs font-black text-[#3D3721] uppercase tracking-widest mb-4 opacity-60">對白顏色</label>
                <div className="grid grid-cols-5 gap-3">
                  {['#F85E00', '#FFB563', '#3D3721', '#000000', '#ffffff', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full border-4 transition-transform ${color === c ? 'border-[#F85E00] scale-125 z-10' : 'border-transparent shadow-sm'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={addTextOverlay}
                disabled={!text}
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-[0.98] ${text ? 'bg-[#3D3721] text-white hover:bg-[#1a180f]' : 'bg-[#3D3721]/10 text-[#3D3721]/30 cursor-not-allowed shadow-none'}`}
              >
                套用文字
              </button>
            </div>
          )}

          {tool === 'filter' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#3D3721] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sun className="w-4 h-4 text-[#F85E00]" /> 亮度
                  </label>
                  <span className="text-xs font-black text-[#3D3721]">{brightness}%</span>
                </div>
                <input 
                  type="range" min="50" max="180" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-[#F85E00]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#3D3721] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-[#F85E00]" /> 對比
                  </label>
                  <span className="text-xs font-black text-[#3D3721]">{contrast}%</span>
                </div>
                <input 
                  type="range" min="50" max="180" 
                  value={contrast} 
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-[#F85E00]"
                />
              </div>

              <button 
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-black text-[#3D3721] hover:text-[#F85E00] transition-all py-4 border-2 border-dashed border-[#FFFBF5] rounded-2xl hover:border-[#F85E00]"
              >
                <RotateCcw className="w-4 h-4" /> 回復初始設定
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
