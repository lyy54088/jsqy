import React, { useState, useEffect } from 'react';
import { MapPin, Users, MessageCircle, Camera, Send, Plus, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { getSafeImageUrl } from '@/lib/image-proxy';
import { communityApi, Community as ApiCommunity, Message as ApiMessage, CreateCommunityData, CreateMessageData } from '@/services/communityApi';

interface Community extends Omit<ApiCommunity, 'createdAt' | 'updatedAt'> {
  distance?: number;
  isJoined: boolean;
}

interface Message extends Omit<ApiMessage, 'createdAt'> {
  username: string;
  timestamp: Date;
}

const Community: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'list' | 'chat' | 'create'>('list');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityMessages, setCommunityMessages] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // localStorage 键名常量（仅用于位置信息）
  const STORAGE_KEYS = {
    USER_LOCATION: 'fitness_user_location'
  };

  // 从localStorage加载用户位置
  const loadUserLocation = () => {
    try {
      const savedLocation = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        setUserLocation(parsedLocation);
        setLocationPermission('granted');
        return parsedLocation;
      }
    } catch (error) {
      console.error('从localStorage加载用户位置失败:', error);
    }
    return null;
  };

  // 保存用户位置到localStorage
  const saveUserLocation = (location: {latitude: number, longitude: number}) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('保存用户位置失败:', error);
    }
  };

  // 从API加载社群列表
  const loadCommunities = async () => {
    try {
      let apiCommunities: ApiCommunity[] = [];
      
      if (userLocation) {
        // 如果有位置信息，获取附近的社群
        apiCommunities = await communityApi.getNearbyCommunities(
          userLocation.latitude,
          userLocation.longitude,
          10
        );
      } else {
        // 否则获取推荐社群
        apiCommunities = await communityApi.getRecommendedCommunities(1, 20);
      }

      // 转换为前端格式
      const frontendCommunities: Community[] = apiCommunities.map(community => ({
        ...community,
        isJoined: false, // TODO: 从用户状态获取
        distance: userLocation && community.location ? 
          calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            community.location.latitude,
            community.location.longitude
          ) : undefined
      }));

      setCommunities(frontendCommunities);
    } catch (error) {
      console.error('加载社群列表失败:', error);
    }
  };

  // 计算距离（公里）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球半径（公里）
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // 保留一位小数
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  // 创建社群表单状态
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    avatar: '🏃‍♂️',
    category: 'fitness',
    isPublic: true,
    maxMembers: 100
  });

  // 请求位置权限
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理定位');
      setLocationPermission('denied');
      await loadCommunities(); // 加载推荐社群
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setUserLocation(location);
      setLocationPermission('granted');
      saveUserLocation(location); // 保存位置信息
      
      // 加载附近的社群
      await loadCommunities();
    } catch (error) {
      console.error('获取位置失败:', error);
      setLocationPermission('denied');
      
      // 加载推荐社群
      await loadCommunities();
    }
  };

  // 加入社群
  const joinCommunity = async (communityId: string) => {
    try {
      const userId = user?.id || `temp_user_${Date.now()}`;
      await communityApi.joinCommunity(communityId, userId);
      
      // 更新本地状态
      const updatedCommunities = communities.map(community => 
        community.id === communityId 
          ? { ...community, isJoined: true, memberCount: community.memberCount + 1 }
          : community
      );
      setCommunities(updatedCommunities);
    } catch (error) {
      console.error('加入社群失败:', error);
      alert('加入社群失败，请稍后重试');
    }
  };

  // 进入聊天
  const enterChat = (community: Community) => {
    setSelectedCommunity(community);
    setCurrentView('chat');
    loadChatMessages(community.id);
  };

  // 加载聊天消息
  const loadChatMessages = async (communityId: string) => {
    try {
      // 从API获取聊天消息
      const apiMessages = await communityApi.getCommunityMessages(communityId, 1, 50);
      
      // 转换为前端格式
      const frontendMessages: Message[] = apiMessages.map(msg => ({
        ...msg,
        username: msg.nickname || `用户${msg.userId.slice(-4)}`,
        timestamp: new Date(msg.createdAt),
        avatar: msg.avatar || '👤'
      }));

      // 按时间正序排列（最早的在前）
      frontendMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setMessages(frontendMessages);
      
      // 更新本地缓存
      const updatedMessages = {
        ...communityMessages,
        [communityId]: frontendMessages
      };
      setCommunityMessages(updatedMessages);
    } catch (error) {
      console.error('加载聊天消息失败:', error);
      setMessages([]);
    }
  };

  // 添加状态来管理待发送的图片
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  // 发送消息
  const sendMessage = async () => {
    if ((!newMessage.trim() && !pendingImage) || !user || !selectedCommunity) return;

    try {
      const userId = user.id || `temp_user_${Date.now()}`;
      const messageData: CreateMessageData = {
        content: newMessage.trim() || (pendingImage ? '[图片]' : ''),
        type: pendingImage ? 'image' : 'text',
        image: pendingImage || undefined,
        userId
      };

      // 发送到API
      const apiMessage = await communityApi.sendMessage(selectedCommunity.id, messageData);
      
      // 转换为前端格式
      const frontendMessage: Message = {
        ...apiMessage,
        username: apiMessage.nickname || user.nickname,
        timestamp: new Date(apiMessage.createdAt),
        avatar: user.avatar || '👤'
      };

      // 更新当前消息列表
      const updatedMessages = [...messages, frontendMessage];
      setMessages(updatedMessages);
      
      // 同时更新社群消息记录
      const updatedCommunityMessages = {
        ...communityMessages,
        [selectedCommunity.id]: updatedMessages
      };
      setCommunityMessages(updatedCommunityMessages);
      
      setNewMessage('');
      setPendingImage(null);
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请稍后重试');
    }
  };

  // 选择图片（不立即发送）
  const selectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPendingImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 移除待发送的图片
  const removePendingImage = () => {
    setPendingImage(null);
  };

  // 发送位置
  const sendLocation = async () => {
    if (!user || !selectedCommunity) return;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const userId = user.id || `temp_user_${Date.now()}`;
      const messageData: CreateMessageData = {
        content: '[位置信息]',
        type: 'location',
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: '当前位置'
        },
        userId
      };

      // 发送到API
      const apiMessage = await communityApi.sendMessage(selectedCommunity.id, messageData);
      
      // 转换为前端格式
      const frontendMessage: Message = {
        ...apiMessage,
        username: apiMessage.nickname || user.nickname,
        timestamp: new Date(apiMessage.createdAt),
        avatar: user.avatar || '👤'
      };

      // 更新当前消息列表
      const updatedMessages = [...messages, frontendMessage];
      setMessages(updatedMessages);
      
      // 同时更新社群消息记录
      const updatedCommunityMessages = {
        ...communityMessages,
        [selectedCommunity.id]: updatedMessages
      };
      setCommunityMessages(updatedCommunityMessages);
    } catch (error) {
      console.error('发送位置失败:', error);
      alert('获取位置失败，请检查位置权限');
    }
  };

  // 创建社群
  const createCommunity = async () => {
    if (!createForm.name.trim() || !user) return;

    try {
      const userId = user.id || `temp_user_${Date.now()}`;
      const communityData: CreateCommunityData = {
        name: createForm.name.trim(),
        description: createForm.description,
        avatar: createForm.avatar,
        isPublic: createForm.isPublic,
        maxMembers: createForm.maxMembers,
        location: userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          address: '当前位置'
        } : undefined,
        userId
      };

      // 调用API创建社群
      const apiCommunity = await communityApi.createCommunity(communityData);
      
      // 转换为前端格式
      const newCommunity: Community = {
        ...apiCommunity,
        isJoined: true,
        distance: userLocation && apiCommunity.location ? 
          calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            apiCommunity.location.latitude,
            apiCommunity.location.longitude
          ) : undefined
      };

      const updatedCommunities = [newCommunity, ...communities];
      setCommunities(updatedCommunities);
      
      setCreateForm({
        name: '',
        description: '',
        avatar: '🏃‍♂️',
        category: 'fitness',
        isPublic: true,
        maxMembers: 100
      });
      setCurrentView('list');
    } catch (error) {
      console.error('创建社群失败:', error);
      alert('创建社群失败，请稍后重试');
    }
  };

  useEffect(() => {
    // 首先加载用户位置
    const savedLocation = loadUserLocation();
    
    // 然后处理位置权限和加载社群
    if (locationPermission === 'prompt') {
      requestLocationPermission();
    } else {
      // 如果已有位置权限状态，直接加载社群
      loadCommunities();
    }
  }, []);

  // 监听userLocation变化，重新加载社群
  useEffect(() => {
    if (locationPermission !== 'prompt') {
      loadCommunities();
    }
  }, [userLocation]);

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 创建社群头部 */}
        <div className="bg-white shadow-sm border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('list')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← 返回
            </button>
            <h1 className="text-lg font-semibold text-gray-900">创建社群</h1>
            <button
              onClick={createCommunity}
              disabled={!createForm.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建
            </button>
          </div>
        </div>

        {/* 创建表单 */}
        <div className="p-4 space-y-6">
          {/* 社群头像选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择头像
            </label>
            <div className="grid grid-cols-6 gap-3">
              {['🏃‍♂️', '💪', '🧘‍♀️', '🚴‍♂️', '🏊‍♂️', '⚽', '🏀', '🎾', '🏋️‍♂️', '🤸‍♀️', '🏃‍♀️', '🥊'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setCreateForm(prev => ({ ...prev, avatar: emoji }))}
                  className={`text-3xl p-3 rounded-lg border-2 ${
                    createForm.avatar === emoji 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 社群名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              社群名称 *
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入社群名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{createForm.name.length}/50</p>
          </div>

          {/* 社群描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              社群描述
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="介绍一下你的社群..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{createForm.description.length}/200</p>
          </div>

          {/* 社群类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              社群类型
            </label>
            <select
              value={createForm.category}
              onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fitness">健身</option>
              <option value="running">跑步</option>
              <option value="yoga">瑜伽</option>
              <option value="cycling">骑行</option>
              <option value="swimming">游泳</option>
              <option value="other">其他</option>
            </select>
          </div>

          {/* 最大成员数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大成员数
            </label>
            <input
              type="number"
              value={createForm.maxMembers}
              onChange={(e) => setCreateForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 100 }))}
              min="10"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 公开设置 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={createForm.isPublic}
                onChange={(e) => setCreateForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">公开社群（其他用户可以搜索并加入）</span>
            </label>
          </div>

          {/* 位置信息 */}
          {userLocation && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">将使用您的当前位置作为社群位置</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'chat' && selectedCommunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('list')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-2xl">{selectedCommunity.avatar}</div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedCommunity.name}</h2>
              <p className="text-sm text-gray-500">{selectedCommunity.memberCount} 成员</p>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="text-2xl">{message.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{message.username}</span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-gray-800">{message.content}</p>
                  
                  {message.image && (
                    <img 
                      src={getSafeImageUrl(message.image, message.username)} 
                      alt="分享图片" 
                      className="mt-2 rounded-lg max-w-xs"
                    />
                  )}
                  
                  {message.location && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">{message.location.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 消息输入 */}
        <div className="bg-white border-t p-4">
          {/* 图片预览 */}
          {pendingImage && (
            <div className="mb-3 relative inline-block">
              <img 
                src={pendingImage} 
                alt="待发送图片" 
                className="max-w-32 max-h-32 rounded-lg border"
              />
              <button
                onClick={removePendingImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={pendingImage ? "添加文字说明..." : "输入消息..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={selectImage}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={sendLocation}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && !pendingImage}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">健身社群</h1>
          </div>
          <button 
            onClick={() => setCurrentView('create')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 位置权限提示 */}
      {locationPermission === 'denied' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <MapPin className="w-5 h-5 text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-yellow-700">
                开启位置权限可以发现附近的健身社群
              </p>
              <button 
                onClick={requestLocationPermission}
                className="text-sm text-yellow-800 underline mt-1"
              >
                重新授权
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索社群..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 社群列表 */}
      <div className="px-4 pb-4 space-y-3">
        {communities.map((community) => (
          <div key={community.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{community.avatar}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{community.name}</h3>
                  {community.distance && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {community.distance}km
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {community.memberCount} 成员
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {community.location.address}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {community.isJoined ? (
                      <button
                        onClick={() => enterChat(community)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        聊天
                      </button>
                    ) : (
                      <button
                        onClick={() => joinCommunity(community.id)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50"
                      >
                        加入
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无社群数据</p>
          <button 
            onClick={requestLocationPermission}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            开启位置权限发现附近社群
          </button>
        </div>
      )}
    </div>
  );
};

export default Community;