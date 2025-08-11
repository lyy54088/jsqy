# AI健身教练 - 保证金管理系统 API 规范

## OpenAPI 3.0 规范

```yaml
openapi: 3.0.3
info:
  title: AI健身教练 - 保证金管理系统 API
  description: |
    AI健身教练应用的保证金管理系统API，提供保证金购买、退款、统计等功能。
    
    ## 功能特性
    - 保证金购买记录管理
    - 支付状态跟踪
    - 退款处理
    - 使用历史记录
    - 统计报表
    - 数据导出
    
    ## 认证方式
    使用JWT Bearer Token进行认证，在请求头中添加：
    ```
    Authorization: Bearer <jwt_token>
    ```
  version: 1.0.0
  contact:
    name: AI健身教练开发团队
    email: dev@fitness-coach.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:3000/api/v1
    description: 开发环境
  - url: https://api.fitness-coach.com/v1
    description: 生产环境

security:
  - bearerAuth: []

paths:
  /deposit/records:
    get:
      summary: 获取保证金购买记录列表
      description: 分页获取保证金购买记录，支持按状态、用户等条件筛选
      tags:
        - 保证金管理
      parameters:
        - name: page
          in: query
          description: 页码，从1开始
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: 每页记录数
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
        - name: status
          in: query
          description: 保证金状态筛选
          required: false
          schema:
            type: string
            enum: [pending, active, used, refunded, expired]
        - name: userId
          in: query
          description: 用户ID筛选
          required: false
          schema:
            type: string
        - name: contractId
          in: query
          description: 契约ID筛选
          required: false
          schema:
            type: string
      responses:
        '200':
          description: 成功获取保证金记录列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      records:
                        type: array
                        items:
                          $ref: '#/components/schemas/DepositRecord'
                      pagination:
                        $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

    post:
      summary: 创建保证金购买记录
      description: 创建新的保证金购买记录，生成支付订单
      tags:
        - 保证金管理
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - userId
                - contractId
                - amount
                - paymentMethod
              properties:
                userId:
                  type: string
                  description: 用户ID
                  example: "507f1f77bcf86cd799439012"
                contractId:
                  type: string
                  description: 契约ID
                  example: "507f1f77bcf86cd799439013"
                amount:
                  type: number
                  description: 保证金金额（元）
                  minimum: 1
                  example: 500
                paymentMethod:
                  type: string
                  enum: [wechat, alipay, bank_card]
                  description: 支付方式
                  example: "wechat"
                description:
                  type: string
                  description: 保证金描述
                  example: "健身契约保证金"
      responses:
        '201':
          description: 保证金记录创建成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/DepositRecord'
                  message:
                    type: string
                    example: "保证金记录创建成功"
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /deposit/records/{id}:
    get:
      summary: 获取保证金购买记录详情
      description: 根据记录ID获取保证金详细信息，包括使用历史
      tags:
        - 保证金管理
      parameters:
        - name: id
          in: path
          required: true
          description: 保证金记录ID
          schema:
            type: string
            example: "507f1f77bcf86cd799439011"
      responses:
        '200':
          description: 成功获取保证金记录详情
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/DepositRecordDetail'
        '404':
          $ref: '#/components/responses/NotFound'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /deposit/records/{id}/refund:
    post:
      summary: 申请保证金退款
      description: 为指定的保证金记录申请退款
      tags:
        - 保证金管理
      parameters:
        - name: id
          in: path
          required: true
          description: 保证金记录ID
          schema:
            type: string
            example: "507f1f77bcf86cd799439011"
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
                  description: 退款原因
                  example: "合同结束退款"
                amount:
                  type: number
                  description: 退款金额（元），不填则全额退款
                  minimum: 0.01
                  example: 500
      responses:
        '200':
          description: 退款申请提交成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/RefundResult'
                  message:
                    type: string
                    example: "退款申请已提交，预计3个工作日内完成"
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /deposit/statistics:
    get:
      summary: 获取保证金统计信息
      description: 获取保证金相关的统计数据，包括总量、趋势等
      tags:
        - 保证金管理
      parameters:
        - name: userId
          in: query
          description: 用户ID筛选（可选）
          required: false
          schema:
            type: string
        - name: startDate
          in: query
          description: 开始日期（YYYY-MM-DD）
          required: false
          schema:
            type: string
            format: date
            example: "2024-01-01"
        - name: endDate
          in: query
          description: 结束日期（YYYY-MM-DD）
          required: false
          schema:
            type: string
            format: date
            example: "2024-12-31"
      responses:
        '200':
          description: 成功获取统计信息
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/DepositStatistics'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /deposit/export:
    get:
      summary: 导出保证金记录表格
      description: 导出保证金记录为Excel或CSV格式
      tags:
        - 保证金管理
      parameters:
        - name: format
          in: query
          description: 导出格式
          required: false
          schema:
            type: string
            enum: [excel, csv]
            default: excel
        - name: startDate
          in: query
          description: 开始日期（YYYY-MM-DD）
          required: false
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          description: 结束日期（YYYY-MM-DD）
          required: false
          schema:
            type: string
            format: date
        - name: status
          in: query
          description: 状态筛选
          required: false
          schema:
            type: string
            enum: [pending, active, used, refunded, expired]
      responses:
        '200':
          description: 导出文件生成成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/ExportResult'
                  message:
                    type: string
                    example: "导出文件已生成，请在24小时内下载"
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /deposit/callback:
    post:
      summary: 支付回调处理
      description: 处理第三方支付平台的回调通知
      tags:
        - 保证金管理
      security: []  # 回调接口不需要认证
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - paymentMethod
                - transactionId
                - status
                - amount
              properties:
                paymentMethod:
                  type: string
                  enum: [wechat, alipay, bank_card]
                  description: 支付方式
                  example: "wechat"
                transactionId:
                  type: string
                  description: 交易ID
                  example: "wx_20240101_001"
                status:
                  type: string
                  enum: [success, failed, pending]
                  description: 支付状态
                  example: "success"
                amount:
                  type: number
                  description: 支付金额（元）
                  example: 500
                orderId:
                  type: string
                  description: 订单ID
                  example: "order_123456"
                signature:
                  type: string
                  description: 签名验证
                  example: "abc123def456"
      responses:
        '200':
          description: 回调处理成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "支付回调处理成功"
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalServerError'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    DepositRecord:
      type: object
      properties:
        _id:
          type: string
          description: 记录ID
          example: "507f1f77bcf86cd799439011"
        userId:
          type: string
          description: 用户ID
          example: "507f1f77bcf86cd799439012"
        contractId:
          type: string
          description: 契约ID
          example: "507f1f77bcf86cd799439013"
        amount:
          type: number
          description: 保证金金额（元）
          example: 500
        paymentMethod:
          type: string
          enum: [wechat, alipay, bank_card]
          description: 支付方式
          example: "wechat"
        paymentInfo:
          type: object
          properties:
            transactionId:
              type: string
              description: 交易ID
              example: "wx_20240101_001"
            paidAt:
              type: string
              format: date-time
              description: 支付时间
              example: "2024-01-01T10:00:00Z"
            status:
              type: string
              enum: [pending, paid, failed]
              description: 支付状态
              example: "paid"
        status:
          type: string
          enum: [pending, active, used, refunded, expired]
          description: 保证金状态
          example: "active"
        description:
          type: string
          description: 保证金描述
          example: "健身契约保证金"
        expiresAt:
          type: string
          format: date-time
          description: 过期时间
          example: "2024-12-31T23:59:59Z"
        createdAt:
          type: string
          format: date-time
          description: 创建时间
          example: "2024-01-01T10:00:00Z"
        updatedAt:
          type: string
          format: date-time
          description: 更新时间
          example: "2024-01-01T10:00:00Z"

    DepositRecordDetail:
      allOf:
        - $ref: '#/components/schemas/DepositRecord'
        - type: object
          properties:
            usageHistory:
              type: array
              description: 使用历史记录
              items:
                type: object
                properties:
                  action:
                    type: string
                    enum: [deduct, refund, transfer]
                    description: 操作类型
                    example: "deduct"
                  amount:
                    type: number
                    description: 操作金额（元）
                    example: 50
                  reason:
                    type: string
                    description: 操作原因
                    example: "违约扣除"
                  timestamp:
                    type: string
                    format: date-time
                    description: 操作时间
                    example: "2024-06-01T10:00:00Z"
            availableAmount:
              type: number
              description: 可用金额（元）
              example: 450
            usedAmount:
              type: number
              description: 已使用金额（元）
              example: 50

    RefundResult:
      type: object
      properties:
        refundId:
          type: string
          description: 退款ID
          example: "refund_1735639652"
        recordId:
          type: string
          description: 保证金记录ID
          example: "507f1f77bcf86cd799439011"
        amount:
          type: number
          description: 退款金额（元）
          example: 500
        reason:
          type: string
          description: 退款原因
          example: "合同结束退款"
        status:
          type: string
          enum: [processing, completed, failed]
          description: 退款状态
          example: "processing"
        appliedAt:
          type: string
          format: date-time
          description: 申请时间
          example: "2024-01-01T10:00:00Z"
        estimatedCompletionTime:
          type: string
          format: date-time
          description: 预计完成时间
          example: "2024-01-04T10:00:00Z"

    DepositStatistics:
      type: object
      properties:
        totalDeposits:
          type: integer
          description: 总保证金记录数
          example: 10
        totalAmount:
          type: number
          description: 总保证金金额（元）
          example: 5000
        activeDeposits:
          type: integer
          description: 活跃保证金记录数
          example: 8
        activeAmount:
          type: number
          description: 活跃保证金金额（元）
          example: 4000
        refundedDeposits:
          type: integer
          description: 已退款记录数
          example: 2
        refundedAmount:
          type: number
          description: 已退款金额（元）
          example: 1000
        averageDepositAmount:
          type: number
          description: 平均保证金金额（元）
          example: 500
        monthlyTrend:
          type: array
          description: 月度趋势
          items:
            type: object
            properties:
              month:
                type: string
                description: 月份（YYYY-MM）
                example: "2024-01"
              deposits:
                type: integer
                description: 当月保证金记录数
                example: 2
              amount:
                type: number
                description: 当月保证金金额（元）
                example: 1000
        paymentMethodDistribution:
          type: object
          description: 支付方式分布
          properties:
            wechat:
              type: object
              properties:
                count:
                  type: integer
                  example: 6
                amount:
                  type: number
                  example: 3000
            alipay:
              type: object
              properties:
                count:
                  type: integer
                  example: 4
                amount:
                  type: number
                  example: 2000

    ExportResult:
      type: object
      properties:
        downloadUrl:
          type: string
          description: 下载链接
          example: "http://localhost:3000/downloads/deposit_records_1735639652.xlsx"
        fileName:
          type: string
          description: 文件名
          example: "保证金记录_2024-01-01.xlsx"
        recordCount:
          type: integer
          description: 记录数量
          example: 10
        fileSize:
          type: string
          description: 文件大小
          example: "15.2KB"
        expiresAt:
          type: string
          format: date-time
          description: 下载链接过期时间
          example: "2024-01-02T10:00:00Z"

    Pagination:
      type: object
      properties:
        page:
          type: integer
          description: 当前页码
          example: 1
        limit:
          type: integer
          description: 每页记录数
          example: 10
        total:
          type: integer
          description: 总记录数
          example: 100
        pages:
          type: integer
          description: 总页数
          example: 10

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          description: 错误信息
          example: "请求参数错误"
        error:
          type: string
          description: 错误详情（仅开发环境）
          example: "ValidationError: amount is required"

  responses:
    BadRequest:
      description: 请求参数错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            message: "请求参数错误"

    Unauthorized:
      description: 未授权访问
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            message: "需要认证token"

    NotFound:
      description: 资源不存在
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            message: "保证金记录不存在"

    InternalServerError:
      description: 服务器内部错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            message: "服务器内部错误"
```

## API 使用示例

### 1. 获取保证金记录列表

```bash
curl -X GET "http://localhost:3000/api/v1/deposit/records?page=1&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

### 2. 创建保证金记录

```bash
curl -X POST "http://localhost:3000/api/v1/deposit/records" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "contractId": "contract456",
    "amount": 500,
    "paymentMethod": "wechat",
    "description": "健身契约保证金"
  }'
```

### 3. 申请退款

```bash
curl -X POST "http://localhost:3000/api/v1/deposit/records/507f1f77bcf86cd799439011/refund" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "合同结束退款",
    "amount": 500
  }'
```

### 4. 获取统计信息

```bash
curl -X GET "http://localhost:3000/api/v1/deposit/statistics" \
  -H "Authorization: Bearer <jwt_token>"
```

### 5. 导出数据

```bash
curl -X GET "http://localhost:3000/api/v1/deposit/export?format=excel&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <jwt_token>"
```

## 错误处理

API 使用统一的错误响应格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息（仅开发环境）"
}
```

常见HTTP状态码：
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权访问
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器内部错误

## 认证说明

所有API接口（除支付回调外）都需要在请求头中携带JWT Token：

```
Authorization: Bearer <jwt_token>
```

Token 获取方式请参考用户认证API文档。

## 限流说明

为保护服务稳定性，API实施了以下限流策略：
- 一般接口：每分钟100次请求
- 支付相关接口：每分钟10次请求
- 导出接口：每小时5次请求

超出限制时将返回 `429 Too Many Requests` 状态码。

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

### 4. 保证金购买记录

#### 4.1 获取保证金购买记录列表

**GET** `/deposit/records`

**查询参数:**
- `limit` (optional): 返回数量限制，默认20
- `offset` (optional): 分页偏移量，默认0
- `status` (optional): 记录状态筛选 ("pending", "completed", "failed")
- `startDate` (optional): 开始日期 (ISO 8601)
- `endDate` (optional): 结束日期 (ISO 8601)

**响应:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "deposit_123",
        "userId": "user_456",
        "amount": 100.00,
        "currency": "CNY",
        "status": "completed",
        "paymentMethod": "wechat_pay",
        "transactionId": "tx_789",
        "description": "健身计划保证金",
        "createdAt": "2024-01-15T10:30:00Z",
        "completedAt": "2024-01-15T10:31:00Z"
      }
    ],
    "total": 15,
    "hasMore": true
  }
}
```

#### 4.2 创建保证金购买记录

**POST** `/deposit/records`

**请求体:**
```json
{
  "amount": 100.00,
  "currency": "CNY",
  "paymentMethod": "wechat_pay",
  "description": "健身计划保证金",
  "planId": "plan_123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "deposit_124",
    "amount": 100.00,
    "currency": "CNY",
    "status": "pending",
    "paymentMethod": "wechat_pay",
    "paymentUrl": "https://pay.example.com/deposit_124",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2024-01-15T11:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4.3 获取保证金购买记录详情

**GET** `/deposit/records/{recordId}`

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "deposit_123",
    "userId": "user_456",
    "amount": 100.00,
    "currency": "CNY",
    "status": "completed",
    "paymentMethod": "wechat_pay",
    "transactionId": "tx_789",
    "description": "健身计划保证金",
    "planId": "plan_123",
    "refundAmount": 0.00,
    "refundReason": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:31:00Z",
    "refundedAt": null
  }
}
```

#### 4.4 申请保证金退款

**POST** `/deposit/records/{recordId}/refund`

**请求体:**
```json
{
  "reason": "计划完成，申请退款",
  "amount": 100.00
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "refundId": "refund_456",
    "status": "processing",
    "amount": 100.00,
    "estimatedTime": "1-3个工作日",
    "message": "退款申请已提交，请耐心等待处理"
  }
}
```

#### 4.5 获取保证金统计信息

**GET** `/deposit/statistics`

**响应:**
```json
{
  "success": true,
  "data": {
    "totalDeposit": 500.00,
    "availableDeposit": 300.00,
    "frozenDeposit": 200.00,
    "totalRefunded": 100.00,
    "currency": "CNY",
    "recordCount": 8,
    "lastDepositAt": "2024-01-15T10:30:00Z"
  }
}
```

## 版本历史

- **v1.0** (2024-01-15): 初始版本，包含基础社群功能和保证金购买记录管理