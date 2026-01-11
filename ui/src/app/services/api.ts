// ui/src/app/services/api.ts

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastMessage?: string;
  unreadCount?: number;
  lastSeen?: string;
}

interface Message {
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

class ApiService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private wsMessageHandler: ((data: any) => void) | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  }


  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 认证相关
  async login(username: string, password: string): Promise<{ token?: string; user: any }> {
    const response = await this.request<any>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // 适配后端返回格式
    if (response.code === 200 && response.data) {
      return {
        token: response.data.token || 'mock-token', // 如果后端没有返回token，使用mock
        user: {
          id: response.data.userId,
          username: response.data.username,
          name: response.data.nickname || response.data.username,
          avatar: response.data.avatar
        }
      };
    }

    throw new Error(response.message || '登录失败');
  }

  async register(name: string, username: string, password: string): Promise<{ token?: string; user: any }> {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        username,
        password
      }),
    });

    // 根据API文档，成功响应应该直接返回 token 和 user
    if (response.token) {
      return {
        token: response.token,
        user: {
          id: response.user.id,
          username: response.user.username,
          name: response.user.name,
          avatar: response.user.avatar || ''
        }
      };
    }

    // 如果返回的是错误格式
    if (response.error) {
      throw new Error(response.error);
    }

    throw new Error('注册失败');
  }


  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/users/me');
  }

  async updateProfile(name: string, username: string): Promise<User> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, username }),
    });
  }

  // 联系人相关
  async getContacts(): Promise<Contact[]> {
    return this.request('/contacts');
  }

  async addContact(userId: string): Promise<Contact> {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.request(`/contacts/${contactId}`, { method: 'DELETE' });
  }

  // 消息相关
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

  // 文件上传
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
    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed! status: ${response.status}`);
    }

    return response.json();
  }

  // 视频通话相关
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

  // WebSocket 连接
  connectWebSocket(userId: string, onMessage: (data: any) => void): void {
    const token = localStorage.getItem('auth_token');
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws?token=${token}&userId=${userId}`;

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
      // 自动重连
      setTimeout(() => {
        if (this.wsMessageHandler) {
          this.connectWebSocket(userId, this.wsMessageHandler);
        }
      }, 3000);
    };
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.wsMessageHandler = null;
    }
  }

  sendWebSocketMessage(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // 管理员相关
  async getAllUsers(): Promise<User[]> {
    return this.request('/admin/users');
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    return this.request(`/admin/users/${userId}/role`, {
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