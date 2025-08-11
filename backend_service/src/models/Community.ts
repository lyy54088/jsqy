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
  createdAt: Date;
  updatedAt: Date;
  settings: {
    allowInvite: boolean;
    requireApproval: boolean;
    allowAnonymous: boolean;
  };
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  nickname?: string;
  avatar?: string;
}

export interface CommunityInvite {
  id: string;
  communityId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}