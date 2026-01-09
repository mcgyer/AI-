
export interface Sticker {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export enum StickerExpression {
  HAPPY = "開心興奮 (Happy)",
  ANGRY = "生氣挑釁 (Angry)",
  THUMBS_UP = "認同肯定 (Like)",
  CRYING = "難過崩潰 (Crying)",
  THINKING = "困惑思考 (Thinking)",
  EATING = "正在享用美食 (Eating)",
  COOL = "帥氣自信 (Cool)",
  HEART = "心動求饒 (Love)",
  GOOD_NIGHT = "疲累想睡 (Sleepy)",
  SHOCKED = "驚訝震驚 (Shocked)",
  LOL = "開懷大笑 (LOL)"
}
