import { Community, CommunityMember } from '../models/Community';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCommunityData {
  name: string;
  description: string;
  avatar: string;
  creatorId: string;
  isPublic: boolean;
  maxMembers: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  settings?: {
    allowInvite?: boolean;
    requireApproval?: boolean;
    allowAnonymous?: boolean;
  };
}

export class CommunityService {
  private communities: Map<string, Community> = new Map();
  private communityMembers: Map<string, CommunityMember[]> = new Map();

  constructor() {
    // 初始化一些示例数据
    this.initializeDefaultCommunities();
  }

  private initializeDefaultCommunities() {
    const defaultCommunity: Community = {
      id: 'default-fitness',
      name: '健身',
      description: '一起健身，一起进步！',
      avatar: '🏃‍♂️',
      creatorId: 'system',
      memberCount: 1,
      isPublic: true,
      maxMembers: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowInvite: true,
        requireApproval: false,
        allowAnonymous: true
      }
    };

    this.communities.set(defaultCommunity.id, defaultCommunity);
    this.communityMembers.set(defaultCommunity.id, []);
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    const communityId = uuidv4();
    const now = new Date();

    const community: Community = {
      id: communityId,
      name: data.name,
      description: data.description,
      avatar: data.avatar,
      creatorId: data.creatorId,
      memberCount: 1,
      isPublic: data.isPublic,
      maxMembers: data.maxMembers,
      ...(data.location && { location: data.location }),
      createdAt: now,
      updatedAt: now,
      settings: {
        allowInvite: true,
        requireApproval: false,
        allowAnonymous: true,
        ...data.settings
      }
    };

    // 保存社群
    this.communities.set(communityId, community);
    
    // 创建者自动加入社群
    const creatorMember: CommunityMember = {
      id: uuidv4(),
      communityId,
      userId: data.creatorId,
      role: 'owner',
      joinedAt: now,
      nickname: '群主'
    };

    this.communityMembers.set(communityId, [creatorMember]);

    return community;
  }

  async getCommunityById(communityId: string): Promise<Community | null> {
    return this.communities.get(communityId) || null;
  }

  async getNearbyCommunities(
    latitude: number,
    longitude: number,
    radius: number = 10
  ): Promise<Community[]> {
    const allCommunities = Array.from(this.communities.values());
    
    // 过滤出有位置信息且在指定范围内的社群
    return allCommunities.filter(community => {
      if (!community.location || !community.isPublic) {
        return false;
      }

      const distance = this.calculateDistance(
        latitude,
        longitude,
        community.location.latitude,
        community.location.longitude
      );

      return distance <= radius;
    }).sort((a, b) => b.memberCount - a.memberCount);
  }

  async getRecommendedCommunities(page: number = 1, limit: number = 20): Promise<Community[]> {
    const allCommunities = Array.from(this.communities.values())
      .filter(community => community.isPublic)
      .sort((a, b) => b.memberCount - a.memberCount);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return allCommunities.slice(startIndex, endIndex);
  }

  async joinCommunity(communityId: string, userId: string): Promise<CommunityMember> {
    const community = this.communities.get(communityId);
    if (!community) {
      throw new Error('社群不存在');
    }

    const members = this.communityMembers.get(communityId) || [];
    
    // 检查是否已经是成员
    const existingMember = members.find(member => member.userId === userId);
    if (existingMember) {
      throw new Error('您已经是该社群的成员');
    }

    // 检查成员数量限制
    if (members.length >= community.maxMembers) {
      throw new Error('社群人数已满');
    }

    // 创建新成员
    const newMember: CommunityMember = {
      id: uuidv4(),
      communityId,
      userId,
      role: 'member',
      joinedAt: new Date(),
      nickname: `用户${userId.slice(-4)}`
    };

    members.push(newMember);
    this.communityMembers.set(communityId, members);

    // 更新社群成员数量
    community.memberCount = members.length;
    community.updatedAt = new Date();
    this.communities.set(communityId, community);

    return newMember;
  }

  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    const community = this.communities.get(communityId);
    if (!community) {
      throw new Error('社群不存在');
    }

    const members = this.communityMembers.get(communityId) || [];
    const memberIndex = members.findIndex(member => member.userId === userId);
    
    if (memberIndex === -1) {
      throw new Error('您不是该社群的成员');
    }

    const member = members[memberIndex];
    if (!member) {
      throw new Error('成员信息不存在');
    }
    
    // 群主不能离开社群，只能删除社群
    if (member.role === 'owner') {
      throw new Error('群主不能离开社群，请删除社群或转让群主');
    }

    // 移除成员
    members.splice(memberIndex, 1);
    this.communityMembers.set(communityId, members);

    // 更新社群成员数量
    community.memberCount = members.length;
    community.updatedAt = new Date();
    this.communities.set(communityId, community);

    return true;
  }

  async deleteCommunity(communityId: string, userId: string): Promise<boolean> {
    const community = this.communities.get(communityId);
    if (!community) {
      throw new Error('社群不存在');
    }

    // 只有群主可以删除社群
    if (community.creatorId !== userId) {
      throw new Error('只有群主可以删除社群');
    }

    // 删除社群和相关数据
    this.communities.delete(communityId);
    this.communityMembers.delete(communityId);

    return true;
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    return this.communityMembers.get(communityId) || [];
  }

  // 计算两点间距离（公里）
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}