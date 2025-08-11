export interface Message {
  id: string;
  communityId: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  nickname?: string;
  avatar?: string;
  replyTo?: string; // 回复的消息ID
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}