# AI健身教练 - 社群功能 API 接口文档

## 概述

本文档定义了AI健身教练应用中社群功能的API接口规范，包括社群管理、消息系统、位置服务等核心功能。

## 基础信息

- **API版本**: v1.0
- **Base URL**: `https://api.fitness-coach.com/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

所有API请求都需要在Header中携带JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

## 数据模型

### Community (社群)

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "avatar": "string",
  "memberCount": "number",
  "isPublic": "boolean",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string",
    "city": "string",
    "district": "string"
  },
  "settings": {
    "allowImageUpload": "boolean",
    "allowLocationShare": "boolean",
    "requireApproval": "boolean"
  },
  "createdBy": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### CommunityMember (社群成员)

```json
{
  "id": "string",
  "communityId": "string",
  "userId": "string",
  "role": "string", // "owner", "admin", "member"
  "joinedAt": "string (ISO 8601)",
  "status": "string" // "active", "pending", "banned"
}
```

### Message (消息)

```json
{
  "id": "string",
  "communityId": "string",
  "userId": "string",
  "content": "string",
  "type": "string", // "text", "image", "location"
  "attachments": [
    {
      "type": "string", // "image", "location"
      "url": "string",
      "metadata": "object"
    }
  ],
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

## API 接口

### 1. 社群管理

#### 1.1 获取附近社群列表

**GET** `/communities/nearby`

**查询参数:**
- `latitude` (required): 纬度
- `longitude` (required): 经度
- `radius` (optional): 搜索半径(km)，默认10
- `limit` (optional): 返回数量限制，默认20
- `offset` (optional): 分页偏移量，默认0

**响应:**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "community_123",
        "name": "晨跑俱乐部",
        "description": "每天早上6点一起晨跑",
        "avatar": "🏃‍♂️",
        "memberCount": 128,
        "distance": 0.5,
        "isJoined": false,
        "location": {
          "latitude": 39.9042,
          "longitude": 116.4074,
          "address": "朝阳公园",
          "city": "北京市",
          "district": "朝阳区"
        }
      }
    ],
    "total": 15,
    "hasMore": true
  }
}
```

#### 1.2 搜索社群

**GET** `/communities/search`

**查询参数:**
- `q` (required): 搜索关键词
- `latitude` (optional): 纬度
- `longitude` (optional): 经度
- `limit` (optional): 返回数量限制，默认20
- `offset` (optional): 分页偏移量，默认0

**响应:**
```json
{
  "success": true,
  "data": {
    "communities": [...],
    "total": 8,
    "hasMore": false
  }
}
```

#### 1.3 获取社群详情

**GET** `/communities/{communityId}`

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "community_123",
    "name": "晨跑俱乐部",
    "description": "每天早上6点一起晨跑，欢迎所有热爱运动的朋友！",
    "avatar": "🏃‍♂️",
    "memberCount": 128,
    "isJoined": true,
    "userRole": "member",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074,
      "address": "朝阳公园",
      "city": "北京市",
      "district": "朝阳区"
    },
    "settings": {
      "allowImageUpload": true,
      "allowLocationShare": true,
      "requireApproval": false
    },
    "createdAt": "2024-01-15T08:00:00Z"
  }
}
```

#### 1.4 加入社群

**POST** `/communities/{communityId}/join`

**请求体:**
```json
{
  "message": "string" // 可选的申请消息
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "status": "joined", // "joined" 或 "pending"
    "message": "成功加入社群"
  }
}
```

#### 1.5 退出社群

**DELETE** `/communities/{communityId}/leave`

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "已退出社群"
  }
}
```

#### 1.6 获取用户已加入的社群

**GET** `/communities/joined`

**查询参数:**
- `limit` (optional): 返回数量限制，默认20
- `offset` (optional): 分页偏移量，默认0

**响应:**
```json
{
  "success": true,
  "data": {
    "communities": [...],
    "total": 5,
    "hasMore": false
  }
}
```

### 2. 消息系统

#### 2.1 获取社群消息列表

**GET** `/communities/{communityId}/messages`

**查询参数:**
- `limit` (optional): 返回数量限制，默认50
- `before` (optional): 获取指定时间之前的消息
- `after` (optional): 获取指定时间之后的消息

**响应:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "userId": "user_456",
        "user": {
          "id": "user_456",
          "nickname": "小明",
          "avatar": "👨"
        },
        "content": "今天的训练完成了！",
        "type": "text",
        "attachments": [],
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg_124",
        "userId": "user_789",
        "user": {
          "id": "user_789",
          "nickname": "小红",
          "avatar": "👩"
        },
        "content": "[图片]",
        "type": "image",
        "attachments": [
          {
            "type": "image",
            "url": "https://cdn.example.com/images/workout.jpg",
            "metadata": {
              "width": 800,
              "height": 600,
              "size": 245760
            }
          }
        ],
        "createdAt": "2024-01-15T10:32:00Z"
      }
    ],
    "hasMore": true
  }
}
```

#### 2.2 发送文本消息

**POST** `/communities/{communityId}/messages`

**请求体:**
```json
{
  "content": "string",
  "type": "text"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "msg_125",
    "content": "Hello everyone!",
    "type": "text",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

#### 2.3 上传并发送图片消息

**POST** `/communities/{communityId}/messages/image`

**请求体:** `multipart/form-data`
- `image`: 图片文件 (支持 jpg, png, gif, 最大5MB)
- `caption`: 图片说明 (可选)

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "msg_126",
    "content": "[图片]",
    "type": "image",
    "attachments": [
      {
        "type": "image",
        "url": "https://cdn.example.com/images/msg_126.jpg",
        "metadata": {
          "width": 1024,
          "height": 768,
          "size": 512000
        }
      }
    ],
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

#### 2.4 发送位置消息

**POST** `/communities/{communityId}/messages/location`

**请求体:**
```json
{
  "latitude": 39.9042,
  "longitude": 116.4074,
  "address": "朝阳公园南门",
  "description": "今天的训练地点"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "msg_127",
    "content": "[位置信息]",
    "type": "location",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074,
      "address": "朝阳公园南门"
    },
    "createdAt": "2024-01-15T10:45:00Z"
  }
}
```

### 3. 位置服务

#### 3.1 更新用户位置

**PUT** `/user/location`

**请求体:**
```json
{
  "latitude": 39.9042,
  "longitude": 116.4074,
  "accuracy": 10.5,
  "timestamp": "2024-01-15T10:50:00Z"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "位置更新成功"
  }
}
```

#### 3.2 获取地址信息 (逆地理编码)

**GET** `/location/reverse`

**查询参数:**
- `latitude` (required): 纬度
- `longitude` (required): 经度

**响应:**
```json
{
  "success": true,
  "data": {
    "address": "北京市朝阳区朝阳公园南路1号",
    "city": "北京市",
    "district": "朝阳区",
    "street": "朝阳公园南路",
    "poi": "朝阳公园"
  }
}
```

## 错误响应

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object" // 可选的详细信息
  }
}
```

### 常见错误码

- `UNAUTHORIZED` (401): 未授权访问
- `FORBIDDEN` (403): 权限不足
- `NOT_FOUND` (404): 资源不存在
- `VALIDATION_ERROR` (400): 请求参数验证失败
- `COMMUNITY_FULL` (400): 社群人数已满
- `ALREADY_JOINED` (400): 已加入该社群
- `NOT_MEMBER` (403): 不是社群成员
- `FILE_TOO_LARGE` (400): 文件过大
- `UNSUPPORTED_FILE_TYPE` (400): 不支持的文件类型
- `LOCATION_PERMISSION_DENIED` (403): 位置权限被拒绝
- `RATE_LIMIT_EXCEEDED` (429): 请求频率超限

## WebSocket 实时消息

### 连接

**WebSocket URL:** `wss://api.fitness-coach.com/v1/ws`

**连接参数:**
- `token`: JWT Token
- `communityId`: 社群ID (可选，用于订阅特定社群消息)

### 消息格式

#### 接收消息

```json
{
  "type": "message",
  "data": {
    "communityId": "community_123",
    "message": {
      "id": "msg_128",
      "userId": "user_456",
      "user": {
        "id": "user_456",
        "nickname": "小明",
        "avatar": "👨"
      },
      "content": "实时消息内容",
      "type": "text",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

#### 发送消息

```json
{
  "type": "send_message",
  "data": {
    "communityId": "community_123",
    "content": "要发送的消息",
    "type": "text"
  }
}
```

#### 订阅社群

```json
{
  "type": "subscribe",
  "data": {
    "communityId": "community_123"
  }
}
```

#### 取消订阅

```json
{
  "type": "unsubscribe",
  "data": {
    "communityId": "community_123"
  }
}
```

## 限制说明

- 每个用户最多可加入50个社群
- 每个社群最多1000名成员
- 消息内容最大长度：1000字符
- 图片文件最大：5MB
- 支持的图片格式：JPG, PNG, GIF
- API请求频率限制：每分钟100次
- WebSocket连接数限制：每用户最多5个连接

## 版本历史

- **v1.0** (2024-01-15): 初始版本，包含基础社群功能