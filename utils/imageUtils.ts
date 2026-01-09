
export const removeBackgroundFromBase64 = async (base64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // 種子填充演算法 (Flood Fill) 
      // 從四個角落開始，將所有相連的白色區域轉為透明
      const visited = new Uint8Array(width * height);
      const stack: [number, number][] = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
      
      const isWhite = (r: number, g: number, b: number) => {
        // 設定容許度，因為 AI 生成的白色背景可能不是完全的 255,255,255
        return r > 240 && g > 240 && b > 240;
      };

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        const idx = y * width + x;

        if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) continue;

        const pixelIdx = idx * 4;
        if (isWhite(data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2])) {
          visited[idx] = 1;
          data[pixelIdx + 3] = 0; // 設定為透明

          stack.push([x + 1, y]);
          stack.push([x - 1, y]);
          stack.push([x, y + 1]);
          stack.push([x, y - 1]);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
  });
};
