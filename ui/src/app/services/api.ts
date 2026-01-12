// ui/src/app/services/api.ts

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'suspended';
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
    this.baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';
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
    //const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
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
    totalDepartments?: number;
    totalRoles?: number;
  }> {
    try {
      return await this.request('/admin/stats');
    } catch (error) {
      console.warn('后端不可用，使用模拟数据:', error);
      return {
        totalUsers: 247,
        onlineUsers: 189,
        totalMessages: 15420,
        storageUsed: 45.6,
        totalDepartments: 12,
        totalRoles: 5
      };
    }
  }

  // 部门管理
  async getDepartments(): Promise<Department[]> {
    try {
      return await this.request('/admin/departments');
    } catch (error) {
      console.warn('后端不可用，使用模拟数据:', error);
      return [
        { id: '1', name: '技术部', manager: '张三', memberCount: 45 },
        { id: '2', name: '市场部', manager: '李四', memberCount: 32, parent: '1' },
        { id: '3', name: '人力资源部', manager: '王五', memberCount: 18 },
        { id: '4', name: '财务部', manager: '赵六', memberCount: 12 }
      ];
    }
  }

  async createDepartment(name: string, manager: string, parent?: string): Promise<Department> {
    return this.request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ name, manager, parent }),
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
    try {
      return await this.request(`/admin/departments/${departmentId}/members`);
    } catch (error) {
      console.warn('后端不可用，使用模拟数据:', error);
      return [
        {
          id: '1',
          name: '张三',
          username: 'zhangsan',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
          role: '系统管理员',
          department: '技术部',
          status: 'active'
        },
        {
          id: '3',
          name: '王五',
          username: 'wangwu',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
          role: '普通员工',
          department: '技术部',
          status: 'active'
        }
      ];
    }
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

  // 角色管理
  async getRoles(): Promise<Role[]> {
    try {
      return await this.request('/admin/roles');
    } catch (error) {
      console.warn('后端不可用，使用模拟数据:', error);
      return [
        {
          id: '1',
          name: '系统管理员',
          description: '全局审批 + 最终决策权',
          userCount: 3,
          permissions: ['全系统审批', '最终决策权', '人员管理', '数据管理']
        },
        {
          id: '2',
          name: '部门主管',
          description: '本部门审批 + 跨部门申请发起',
          userCount: 8,
          permissions: ['本部门审批', '跨部门申请', '群聊创建']
        },
        {
          id: '3',
          name: '普通员工',
          description: '基础聊天功能',
          userCount: 45,
          permissions: ['发起申请', '查看个人数据']
        }
      ];
    }
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
    try {
      return await this.request(`/admin/roles/${roleId}/members`);
    } catch (error) {
      console.warn('后端不可用，使用模拟数据:', error);
      // 根据角色 ID 返回不同的模拟数据
      if (roleId === '1') {
        return [
          {
            id: '1',
            name: '张三',
            username: 'zhangsan',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
            role: '系统管理员',
            department: '技术部',
            status: 'active'
          }
        ];
      }
      return [
        {
          id: '2',
          name: '李四',
          username: 'lisi',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
          department: '市场部',
          status: 'active'
        }
      ];
    }
  }

  async assignUserRole(userId: string, roleId: string): Promise<void> {
    await this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      return await this.request(`/admin/roles/${roleId}/permissions`);
    } catch (error) {
      // 开发模式：如果后端不可用，返回模拟数据
      console.warn('后端不可用，使用本地模拟模式:', error);

      // 尝试从本地存储读取
      const mockKey = `mock_role_permissions_${roleId}`;
      const savedData = localStorage.getItem(mockKey);

      if (savedData) {
        const permissionIds = JSON.parse(savedData);
        // 返回简单的权限对象数组
        return permissionIds.map((id: string) => ({
          id,
          name: id.split('.').pop() || id,
          description: `权限 ${id}`,
          category: id.split('.')[0] || 'default'
        }));
      }

      // 返回空数组，表示没有权限
      return [];
    }
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      await this.request(`/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissionIds }),
      });
    } catch (error) {
      // 开发模式：如果后端不可用，使用本地存储模拟
      console.warn('后端不可用，使用本地模拟模式:', error);

      // 保存到本地存储
      const mockKey = `mock_role_permissions_${roleId}`;
      localStorage.setItem(mockKey, JSON.stringify(permissionIds));

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(`权限已保存到本地存储 (角色 ${roleId}):`, permissionIds);
    }
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