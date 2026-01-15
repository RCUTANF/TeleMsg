// ui/src/app/services/api.ts

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
  department?: string;
  departmentId?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  isAdmin?: boolean;
  lastActive?: string;
  createdAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  lastSeen?: string;
  parentGroupId?: string; // For discussion spaces: parent group ID
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileId?: string;
  status: 'sending' | 'sent' | 'read';
}
// 登录/注册响应接口
interface AuthResponse {
    token: string;
    user: User;
}
export interface Department {
  id: string;
  name: string;
  parent?: string;
  manager: string;
  memberCount: number;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface SystemStats {
  totalUsers: number;
  onlineUsers: number;
  totalMessages: number;
  storageUsed: number;
  totalDepartments?: number;
  totalRoles?: number;
}

export interface ApprovalRequest {
  id: string;
  type: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  data: any;
  comment?: string;
  reason?: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'system' | 'approval' | 'warning';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface DiscussionSpace {
  id: string;
  name: string;
  groupId: string;
  creatorId: string;
  members: string[];
  createdAt: Date;
  description?: string;
}

// 登录/注册响应接口
interface AuthResponse {
  token: string;
  user: User;
}

class ApiService {
  private baseUrl: string;
  private wsBaseUrl: string;
  private ws: WebSocket | null = null;
  private wsMessageHandler: ((data: any) => void) | null = null;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';
    this.wsBaseUrl = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8080/api/ws';
  }

  /**
   * 将相对文件URL转换为绝对URL
   */
  getAbsoluteFileUrl(relativeUrl: string | undefined): string {
    if (!relativeUrl) {
      // 返回一个本地生成的占位符图片的data URL
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 设置背景
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加文本
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暂无图片', canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL();
      }
      // 如果canvas不可用，返回一个简单的SVG
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#6b7280">暂无图片</text>
        </svg>
      `);
    }

    // 如果已经是完整URL，直接返回
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }

    // 如果是相对路径，转换为绝对路径
    if (relativeUrl.startsWith('/api/')) {
      return this.baseUrl.replace('/api', '') + relativeUrl;
    }

    return relativeUrl;
  }

  // 核心请求方法封装
  private async request<T>(
      endpoint: string,
      options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // 明确告诉后端我们需要 JSON
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // 尝试解析 JSON
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      data = {}; // 防止解析空响应报错
    }

    // 统一错误处理
    if (!response.ok) {
      // 优先使用后端返回的 error 字段 (符合 API 文档)
      // 其次尝试 message 字段
      // 最后使用 HTTP 状态码
      const errorMessage = data.error || data.message || `请求失败 (${response.status})`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // ==========================================
  // 认证相关 (已根据 API 文档修正)
  // ==========================================

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(name: string, username: string, password: string): Promise<AuthResponse> {
    // 修正: 路径改为 /auth/register
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        username,
        password
      }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token'); // 前端也需要清除 token
  }

  // ==========================================
  // 用户与联系人
  // ==========================================
//TODO(me接口未实现）
  async getCurrentUser(): Promise<User> {
    // 假设获取当前用户信息的接口是 /users/me
    return this.request<User>('/users/me');
  }

  async updateProfile(name: string, username: string): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, username }),
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.request(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.request<any>(`/users/${userId}`);
    return response.data || response;
  }

  async getContacts(): Promise<Contact[]> {
    return this.request<Contact[]>('/contacts');
  }

  async addContact(userId: string): Promise<Contact> {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.request(`/contacts/${contactId}`, { method: 'DELETE' });
  }

  // ==========================================
  // 消息处理
  // ==========================================

  async getMessages(contactId: string): Promise<Message[]> {
    const messages = await this.request<any[]>(`/messages/${contactId}`);
    return messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }

  async getGroupMessages(groupId: string, page: number = 0, size: number = 50): Promise<Message[]> {
    const response = await this.request<any>(`/messages/group/${groupId}?page=${page}&size=${size}`);
    const messages = response.data?.content || response.content || [];
    const mappedMessages = messages.map((msg: any) => ({
      id: msg.messageId || msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      timestamp: new Date(msg.timestamp || msg.createTime),
      type: (msg.messageType || msg.type || 'text').toLowerCase() as 'text' | 'file' | 'image',
      fileUrl: msg.mediaUrl || msg.fileUrl,
      fileName: msg.fileName,
      fileSize: msg.fileSize?.toString(),
      fileId: msg.fileId,
      status: 'sent' as const,
    }));

    // 按时间正序排序（早的消息在上面）
    return mappedMessages.sort((a: { timestamp: { getTime: () => number; }; }, b: { timestamp: { getTime: () => number; }; }) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async sendMessage(
      recipientId: string,
      content: string,
      type: 'text' | 'file' | 'image' = 'text'
  ): Promise<Message> {
    const message = await this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, type }),
    });
    return {
      ...message,
      timestamp: new Date(message.timestamp),
    };
  }

  async sendGroupMessage(
      senderId: string,
      groupId: string,
      content: string,
      messageType: 'text' | 'file' | 'image' = 'text'
  ): Promise<Message> {
    const response = await this.request<any>('/messages/group', {
      method: 'POST',
      body: JSON.stringify({
        senderId,
        groupId,
        content,
        messageType: messageType.toUpperCase()
      }),
    });
    const messageData = response.data || response;
    return {
      id: messageData.messageId || messageData.id,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      timestamp: new Date(messageData.timestamp || messageData.createTime),
      type: (messageData.messageType || messageData.type || messageType).toLowerCase() as 'text' | 'file' | 'image',
      fileUrl: messageData.mediaUrl || messageData.fileUrl,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize?.toString(),
      fileId: messageData.fileId,
      status: 'sent' as const,
    };
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.request(`/messages/${messageId}/read`, { method: 'PUT' });
  }

  async markPrivateMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.request('/messages/private/read', {
      method: 'PUT',
      body: JSON.stringify({ senderId, receiverId }),
    });
  }

  async getUnreadCountFromSender(receiverId: string, senderId: string): Promise<number> {
    const response = await this.request<any>(`/messages/unread/${receiverId}/from/${senderId}`);
    return response.data?.unreadCount || 0;
  }

  async getRecentChats(userId: string): Promise<Message[]> {
    const response = await this.request<any>(`/messages/recent/${userId}`);
    // 后端返回的是 ApiResponse 格式: { success: true, message: "...", data: [...] }
    const messages = response.data || response;
    return Array.isArray(messages) ? messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp || msg.createTime),
    })) : [];
  }

  // ==========================================
  // 文件上传和文件消息
  // ==========================================

  async uploadFile(file: File, contactId: string): Promise<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contactId', contactId);

    const token = localStorage.getItem('auth_token');

    // 注意：文件上传通常不手动设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Upload failed! status: ${response.status}`);
    }

    return response.json();
  }

  async sendFileMessage(
    recipientId: string,
    file: File,
    content?: string
  ): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipientId', recipientId);
    if (content) {
      formData.append('content', content);
    }

    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${this.baseUrl}/messages/send-file`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Send file message failed! status: ${response.status}`);
    }

    const result = await response.json();
    const messageData = result.data || result;

    return {
      ...messageData,
      timestamp: new Date(messageData.timestamp),
    };
  }

  async sendGroupFileMessage(
    senderId: string,
    groupId: string,
    file: File,
    content?: string
  ): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId);
    formData.append('groupId', groupId);
    if (content) {
      formData.append('content', content);
    }

    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${this.baseUrl}/messages/send-group-file`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Send group file message failed! status: ${response.status}`);
    }

    const result = await response.json();
    const messageData = result.data || result;

    return {
      id: messageData.messageId || messageData.id,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content || content || file.name,
      timestamp: new Date(messageData.timestamp || messageData.createTime),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileUrl: messageData.mediaUrl || messageData.fileUrl,
      fileName: messageData.fileName || file.name,
      fileSize: messageData.fileSize?.toString(),
      fileId: messageData.fileId,
      status: 'sent' as const,
    };
  }

  async downloadFile(fileId: string, fileName: string): Promise<void> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Download failed! status: ${response.status}`);
    }

    // 创建下载链接
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 获取带认证的图片Blob URL (用于在<img>标签中显示)
   */
  async getAuthenticatedImageUrl(fileUrl: string | undefined): Promise<string> {
    if (!fileUrl) {
      return this.getAbsoluteFileUrl(undefined);
    }

    // 如果已经是 blob URL 或 data URL，直接返回
    if (fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
      return fileUrl;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const absoluteUrl = this.getAbsoluteFileUrl(fileUrl);

      const response = await fetch(absoluteUrl, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        console.error('Failed to load image:', response.status, response.statusText);
        return this.getAbsoluteFileUrl(undefined); // 返回占位符
      }

      const blob = await response.blob();
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error loading authenticated image:', error);
      return this.getAbsoluteFileUrl(undefined); // 返回占位符
    }
  }

  async getFileDownloadUrl(fileId: string): Promise<string> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${this.baseUrl}/files/${fileId}/url`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Get download URL failed! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data.downloadUrl;
  }

  // ==========================================
  // 视频通话 (WebRTC信令)
  // ==========================================

  async initiateVideoCall(contactId: string, isVoiceOnly: boolean): Promise<{
    callId: string;
    signalData: any;
  }> {
    return this.request('/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ contactId, isVoiceOnly }),
    });
  }

  async answerCall(callId: string, signalData: any): Promise<void> {
    await this.request('/calls/answer', {
      method: 'POST',
      body: JSON.stringify({ callId, signalData }),
    });
  }

  async endCall(callId: string): Promise<void> {
    await this.request('/calls/end', {
      method: 'POST',
      body: JSON.stringify({ callId }),
    });
  }

  // ==========================================
  // Discussion Spaces
  // ==========================================

  async getDiscussionSpaces(groupId?: string): Promise<DiscussionSpace[]> {
    const endpoint = groupId
      ? `/discussion-spaces?groupId=${groupId}`
      : '/discussion-spaces';
    const response = await this.request<any>(endpoint);
    // 转换日期字符串为 Date 对象
    return (response.data || response).map((space: any) => ({
      ...space,
      createdAt: new Date(space.createdAt)
    }));
  }

  async createDiscussionSpace(
    name: string,
    groupId: string,
    members: string[],
    creatorId: string,
    description?: string
  ): Promise<DiscussionSpace> {
    console.log('Creating discussion space with params:', { name, groupId, members, creatorId, description });

    if (!name || !groupId || !creatorId || !members || members.length === 0) {
      throw new Error('创建讨论空间参数不完整');
    }

    const response = await this.request<any>('/discussion-spaces', {
      method: 'POST',
      body: JSON.stringify({ name, groupId, members, creatorId, description }),
    });

    console.log('Discussion space created, response:', response);

    const space = response.data || response;
    return {
      ...space,
      createdAt: new Date(space.createdAt)
    };
  }

  async updateDiscussionSpace(
    spaceId: string,
    updates: Partial<DiscussionSpace>
  ): Promise<DiscussionSpace> {
    const response = await this.request<any>(`/discussion-spaces/${spaceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const space = response.data || response;
    return {
      ...space,
      createdAt: new Date(space.createdAt)
    };
  }

  async deleteDiscussionSpace(spaceId: string, ownerId: string): Promise<void> {
    await this.request(`/discussion-spaces/${spaceId}?ownerId=${ownerId}`, {
      method: 'DELETE',
    });
  }

  async addDiscussionSpaceMembers(spaceId: string, operatorId: string, memberIds: string[]): Promise<DiscussionSpace> {
    const response = await this.request<any>(`/discussion-spaces/${spaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ operatorId, memberIds }),
    });
    const space = response.data || response;
    return {
      ...space,
      createdAt: new Date(space.createdAt)
    };
  }

  async removeDiscussionSpaceMember(spaceId: string, operatorId: string, memberId: string): Promise<DiscussionSpace> {
    const response = await this.request<any>(`/discussion-spaces/${spaceId}/members/${memberId}?operatorId=${operatorId}`, {
      method: 'DELETE',
    });
    const space = response.data || response;
    return {
      ...space,
      createdAt: new Date(space.createdAt)
    };
  }

  // ==========================================
  // 群组相关
  // ==========================================

  async createGroup(groupName: string, description: string, ownerId: string): Promise<any> {
    const response = await this.request<any>('/groups', {
      method: 'POST',
      body: JSON.stringify({ groupName, description, ownerId }),
    });
    return response.data || response;
  }

  async getUserGroups(userId: string): Promise<any[]> {
    const response = await this.request<any>(`/groups/user/${userId}`);
    return response.data || response;
  }

  async getGroupInfo(groupId: string): Promise<any> {
    const response = await this.request<any>(`/groups/${groupId}`);
    return response.data || response;
  }

  async getGroupMembers(groupId: string): Promise<User[]> {
    const response = await this.request<any>(`/groups/${groupId}/members`);
    return response.data || response;
  }

  async joinGroup(groupId: string, userId: string, nickname?: string): Promise<void> {
    await this.request(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, nickname }),
    });
  }

  // ==========================================
  // WebSocket
  // ==========================================

  connectWebSocket(userId: string, onMessage: (data: any) => void): void {
    if (this.ws) {
      console.log('Closing existing WebSocket connection');
      this.ws.close();
    }

    const token = localStorage.getItem('auth_token');
    const wsUrl = `${this.wsBaseUrl}?token=${token}&userId=${userId}`;

    console.log('🔌 Connecting to WebSocket:', wsUrl.replace(token || '', '[TOKEN]'));

    this.ws = new WebSocket(wsUrl);
    this.wsMessageHandler = onMessage;

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
    };

    this.ws.onmessage = (event) => {
      try {
        console.log('📨 WebSocket raw message received:', event.data);
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket parsed message:', data);
        this.wsMessageHandler?.(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error, 'Raw data:', event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      // 简单的重连机制
      setTimeout(() => {
        // 只有当不是主动断开（this.ws 不为 null）时才重连
        if (this.wsMessageHandler) {
          console.log('🔄 Attempting to reconnect WebSocket...');
          this.connectWebSocket(userId, this.wsMessageHandler);
        }
      }, 3000);
    };
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.wsMessageHandler = null; // 清除 handler 防止触发重连
      this.ws.close();
      this.ws = null;
    }
  }

  sendWebSocketMessage(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
    }
  }

  // ==========================================
  // 管理员功能
  // ==========================================

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }

  async createUser(data: {
    username: string;
    password: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    departmentId?: string;
  }): Promise<User> {
    const response: any = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // /auth/register 返回 { token, user } 格式，需要提取 user
    return response.user || response as User;
  }

  async updateUser(userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    isAdmin?: boolean;
  }): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    onlineUsers: number;
    totalMessages: number;
    storageUsed: number;
    totalDepartments?: number;
    totalRoles?: number;
  }> {
    return await this.request('/admin/stats');
  }

  // 部门管理
  async getDepartments(): Promise<Department[]> {
    return this.request('/admin/departments');
  }

  async createDepartment(data: { name: string; manager: string; parent?: string; description?: string }): Promise<Department> {
    return this.request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(departmentId: string, updates: Partial<Department>): Promise<Department> {
    return this.request(`/admin/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    await this.request(`/admin/departments/${departmentId}`, { method: 'DELETE' });
  }

  async getDepartmentMembers(departmentId: string): Promise<User[]> {
    return await this.request(`/admin/departments/${departmentId}/members`);
  }

  async addDepartmentMember(departmentId: string, userId: string): Promise<void> {
    await this.request(`/admin/departments/${departmentId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeDepartmentMember(departmentId: string, userId: string): Promise<void> {
    await this.request(`/admin/departments/${departmentId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async addDepartmentMembers(departmentId: string, userIds: string[]): Promise<void> {
    await this.request(`/admin/departments/${departmentId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  // 角色管理
  async getRoles(): Promise<Role[]> {
    return await this.request('/admin/roles');
  }

  async createRole(name: string, description: string, permissions: string[]): Promise<Role> {
    return this.request('/admin/roles', {
      method: 'POST',
      body: JSON.stringify({ name, description, permissions }),
    });
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    return this.request(`/admin/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.request(`/admin/roles/${roleId}`, { method: 'DELETE' });
  }

  async getRoleMembers(roleId: string): Promise<User[]> {
    return await this.request(`/admin/roles/${roleId}/members`);
  }

  async assignUserRole(userId: string, roleId: string): Promise<void> {
    await this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const response: any = await this.request(`/admin/roles/${roleId}/permissions`);
    return response.permissions || [];
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.request(`/admin/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions: permissionIds }),
    });
  }

  // 权限管理
  async getAllPermissions(): Promise<Permission[]> {
    return this.request('/admin/permissions');
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.request(`/admin/users/${userId}/permissions`);
  }

  // 审批管理
  async getApprovalRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<ApprovalRequest[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/approvals${query}`);
  }

  async approveRequest(requestId: string, comment?: string): Promise<void> {
    await this.request(`/admin/approvals/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async rejectRequest(requestId: string, reason: string): Promise<void> {
    await this.request(`/admin/approvals/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async createApprovalRequest(type: string, data: any): Promise<ApprovalRequest> {
    return this.request('/admin/approvals', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    });
  }

  // 操作日志
  async getOperationLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OperationLog[]> {
    const query = new URLSearchParams(filters as any).toString();
    return this.request(`/admin/logs${query ? `?${query}` : ''}`);
  }

  async exportLogs(filters?: any): Promise<Blob> {
    const query = new URLSearchParams(filters).toString();
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseUrl}/admin/logs/export${query ? `?${query}` : ''}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed! status: ${response.status}`);
    }

    return response.blob();
  }

  // 用户管理（更新）
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateUserDepartment(userId: string, departmentId: string): Promise<User> {
    return this.request(`/admin/users/${userId}/department`, {
      method: 'PUT',
      body: JSON.stringify({ departmentId }),
    });
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.request(`/admin/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  // 通知管理
  async getNotifications(): Promise<Notification[]> {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

