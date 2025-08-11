const API_BASE_URL = 'http://localhost:3000/api';

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  creatorId: string;
  memberCount: number;
  isPublic: boolean;
  maxMembers: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
  settings: {
    allowInvite: boolean;
    requireApproval: boolean;
    allowAnonymous: boolean;
  };
}

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
  createdAt: string;
  nickname?: string;
  avatar?: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  avatar: string;
  isPublic: boolean;
  maxMembers: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  userId: string;
}

export interface CreateMessageData {
  content: string;
  type: 'text' | 'image' | 'location';
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  userId: string;
}

class CommunityApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '请求失败' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // 获取附近的社群
  async getNearbyCommunities(latitude: number, longitude: number, radius: number = 10): Promise<Community[]> {
    return this.request<Community[]>(`/communities/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }

  // 获取推荐社群
  async getRecommendedCommunities(page: number = 1, limit: number = 20): Promise<Community[]> {
    return this.request<Community[]>(`/communities/recommended?page=${page}&limit=${limit}`);
  }

  // 创建社群
  async createCommunity(data: CreateCommunityData): Promise<Community> {
    return this.request<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 获取社群详情
  async getCommunityById(communityId: string): Promise<Community> {
    return this.request<Community>(`/communities/${communityId}`);
  }

  // 加入社群
  async joinCommunity(communityId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/communities/${communityId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // 离开社群
  async leaveCommunity(communityId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/communities/${communityId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // 删除社群
  async deleteCommunity(communityId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/communities/${communityId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // 获取社群消息
  async getCommunityMessages(communityId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    return this.request<Message[]>(`/communities/${communityId}/messages?page=${page}&limit=${limit}`);
  }

  // 发送消息
  async sendMessage(communityId: string, data: CreateMessageData): Promise<Message> {
    return this.request<Message>(`/communities/${communityId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const communityApi = new CommunityApiService();