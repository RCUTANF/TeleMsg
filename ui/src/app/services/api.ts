// ui/src/app/services/api.ts

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastMessage?: string;
  unreadCount?: number;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  status: 'sending' | 'sent' | 'read';
}

// 登录/注册响应接口
interface AuthResponse {
  token: string;
  user: User;
}

class ApiService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private wsMessageHandler: ((data: any) => void) | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
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

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.request(`/messages/${messageId}/read`, { method: 'PUT' });
  }

  // ==========================================
  // 文件上传
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
  // WebSocket
  // ==========================================

  connectWebSocket(userId: string, onMessage: (data: any) => void): void {
    if (this.ws) {
      this.ws.close();
    }

    const token = localStorage.getItem('auth_token');
    // 简单处理 http -> ws, https -> wss
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // 假设 API URL 是 http://localhost:8080/api，我们需要 ws://localhost:8080/ws
    // 这里做个简单的替换逻辑，你需要根据实际部署情况调整
    const wsBaseUrl = this.baseUrl.replace(/^http/, 'ws').replace(/\/api$/, '');
    const wsUrl = `${wsBaseUrl}/ws?token=${token}&userId=${userId}`;

    console.log('Connecting to WebSocket:', wsUrl);

    this.ws = new WebSocket(wsUrl);
    this.wsMessageHandler = onMessage;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.wsMessageHandler?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // 简单的重连机制
      setTimeout(() => {
        // 只有当不是主动断开（this.ws 不为 null）时才重连
        if (this.wsMessageHandler) {
          console.log('Attempting to reconnect WebSocket...');
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
  }> {
    return this.request('/admin/stats');
  }
}

export const apiService = new ApiService();