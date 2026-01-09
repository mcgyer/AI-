
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateSticker = async (
  baseImageBase64: string,
  expression: string,
  customPrompt?: string
): Promise<string | null> => {
  const ai = getAIClient();
  
  // 更新提示詞：強調「不加文字」，僅保留角色神韻一致性
  const promptText = `
    請分析附件圖片中的角色特徵（包括髮型、服飾、配件及整體神韻），並以此角色為基礎生成一張高品質的數位貼圖。
    
    貼圖表現的主題情境為：「${expression}」。
    ${customPrompt ? `額外細節要求：${customPrompt}` : ''}
    
    設計規範：
    1. 角色一致性：請務必完美還原圖中角色的長相、顏色與衣著特徵。
    2. ***禁止加入文字***：請勿在圖片中生成任何文字、對白框、字母或標點符號。僅生成角色主體。
    3. 貼圖風格：乾淨的向量插畫風格，具有清晰厚實的「白色邊框」。
    4. 去背透明：背景必須為「極簡純白色」，確保角色是一個獨立的切塊，方便後續去背。
    5. 表情誇張：面部表情與肢體動作需具有張力，符合通訊軟體貼圖的使用習慣。
    6. 禁止生成無意義的雜亂背景，只需呈現角色主體。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: baseImageBase64.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: promptText },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating sticker:", error);
    throw error;
  }
};
