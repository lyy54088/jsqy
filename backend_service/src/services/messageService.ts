import { Message } from '../models/Message';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMessageData {
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
}

export class MessageService {
  private messages: Map<string, Message[]> = new Map();

  constructor() {
    // 初始化默认社群的示例消息
    this.initializeDefaultMessages();
  }

  private initializeDefaultMessages() {
    const defaultCommunityId = 'default-fitness';
    const defaultMessages: Message[] = [
      {
        id: uuidv4(),
        communityId: defaultCommunityId,
        userId: 'system',
        content: '欢迎加入健身社群！',
        type: 'text',
        createdAt: new Date(Date.now() - 3600000), // 1小时前
        nickname: '系统'
      }
    ];

    this.messages.set(defaultCommunityId, defaultMessages);
  }

  async createMessage(data: CreateMessageData): Promise<Message> {
    const messageId = uuidv4();
    const now = new Date();

    const message: Message = {
      id: messageId,
      communityId: data.communityId,
      userId: data.userId,
      content: data.content,
      type: data.type,
      ...(data.image && { image: data.image }),
      ...(data.location && { location: data.location }),
      createdAt: now,
      nickname: `用户${data.userId.slice(-4)}`
    };

    // 获取社群的消息列表
    const communityMessages = this.messages.get(data.communityId) || [];
    communityMessages.push(message);
    
    // 保持最近1000条消息
    if (communityMessages.length > 1000) {
      communityMessages.splice(0, communityMessages.length - 1000);
    }

    this.messages.set(data.communityId, communityMessages);

    return message;
  }

  async getCommunityMessages(
    communityId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Message[]> {
    const communityMessages = this.messages.get(communityId) || [];
    
    // 按时间倒序排列（最新的在前）
    const sortedMessages = [...communityMessages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return sortedMessages.slice(startIndex, endIndex);
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    for (const communityMessages of this.messages.values()) {
      const message = communityMessages.find(msg => msg.id === messageId);
      if (message) {
        return message;
      }
    }
    return null;
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    for (const [communityId, communityMessages] of this.messages.entries()) {
      const messageIndex = communityMessages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        const message = communityMessages[messageIndex];
        if (!message) {
          throw new Error('消息不存在');
        }
        
        // 只有消息发送者可以删除自己的消息
        if (message.userId !== userId) {
          throw new Error('只能删除自己的消息');
        }

        communityMessages.splice(messageIndex, 1);
        this.messages.set(communityId, communityMessages);
        return true;
      }
    }
    
    throw new Error('消息不存在');
  }

  async getCommunityMessageCount(communityId: string): Promise<number> {
    const communityMessages = this.messages.get(communityId) || [];
    return communityMessages.length;
  }

  async getRecentMessages(communityId: string, count: number = 10): Promise<Message[]> {
    const communityMessages = this.messages.get(communityId) || [];
    
    // 返回最近的消息
    return communityMessages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, count);
  }
}