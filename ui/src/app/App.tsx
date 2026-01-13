// ui/src/app/App.tsx
import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { ContactList, Contact } from './components/ContactList';
import { ChatArea, Message } from './components/ChatArea';
import { SettingsDialog } from './components/SettingsDialog';
import { AdminPanel } from './components/AdminPanel';
import { AdminCenter } from './components/AdminCenter';
import { NotificationCenter } from './components/NotificationCenter';
import { VideoCallDialog } from './components/VideoCallDialog';
import { Button } from './components/ui/button';
import { Bell, Settings, Shield, LogOut, Menu, X } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';
import { apiService } from './services/api';
import { Toaster } from './components/ui/sonner';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminCenterOpen, setAdminCenterOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // 初始化 - 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadCurrentUser();
    }
  }, []);

  // 加载当前用户
  const loadCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      await loadContacts(user.id);
      connectWebSocket(user.id);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('auth_token');
    }
  };

  // 连接 WebSocket
  const connectWebSocket = (userId: string) => {
    apiService.connectWebSocket(userId, handleWebSocketMessage);
  };

  // 处理 WebSocket 消息
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'message':
        handleNewMessage(data.message);
        break;
      case 'notification':
        setUnreadNotifications((prev) => prev + 1);
        break;
      case 'contact_status':
        updateContactStatus(data.contactId, data.status);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // 加载联系人列表
  const loadContacts = async (userId?: string) => {
    try {
      const contactsData = await apiService.getContacts();
      setContacts(contactsData);

      // 加载最近聊天记录
      const userIdToUse = userId || currentUser?.id;
      if (userIdToUse) {
        await loadRecentChats(userIdToUse, contactsData);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  // 加载最近聊天记录并更新联系人
  const loadRecentChats = async (userId: string, contactsList: Contact[]) => {
    try {
      const recentMessages = await apiService.getRecentChats(userId);

      // 创建一个 Map 来存储每个联系人的最后一条消息
      const lastMessageMap = new Map<string, { content: string; timestamp: Date }>();
      // 存储需要查询未读数的联系人ID
      const contactIds = new Set<string>();

      recentMessages.forEach((msg: Message) => {
        // 确定对话的另一方 ID
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

        if (otherUserId) {
          contactIds.add(otherUserId);

          // 只保留最新的消息
          const existing = lastMessageMap.get(otherUserId);
          if (!existing || msg.timestamp > existing.timestamp) {
            lastMessageMap.set(otherUserId, {
              content: msg.content,
              timestamp: msg.timestamp
            });
          }
        }
      });

      // 为每个联系人查询未读消息数
      const unreadCountMap = new Map<string, number>();
      await Promise.all(
        Array.from(contactIds).map(async (contactId) => {
          try {
            const count = await apiService.getUnreadCountFromSender(userId, contactId);
            if (count > 0) {
              unreadCountMap.set(contactId, count);
            }
          } catch (error) {
            console.error(`Failed to get unread count for ${contactId}:`, error);
          }
        })
      );

      // 更新联系人列表，添加 lastMessage、lastMessageTime 和 unreadCount
      const updatedContacts = contactsList.map((contact: Contact) => {
        const lastMsg = lastMessageMap.get(contact.id);
        const unreadCount = unreadCountMap.get(contact.id);
        if (lastMsg) {
          return {
            ...contact,
            lastMessage: lastMsg.content,
            lastMessageTime: lastMsg.timestamp,
            unreadCount: unreadCount // 只有当unreadCount > 0时才在Map中，否则为undefined
          };
        }
        return contact; // 没有最近消息的联系人保持原样
      });

      // 按最后消息时间排序（有消息的在前）
      updatedContacts.sort((a: any, b: any) => {
        if (a.lastMessageTime && b.lastMessageTime) {
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        }
        if (a.lastMessageTime) return -1;
        if (b.lastMessageTime) return 1;
        return 0;
      });

      setContacts(updatedContacts);
    } catch (error) {
      console.error('Failed to load recent chats:', error);
    }
  };

  // 加载聊天记录
  const loadMessages = async (contactId: string) => {
    try {
      const messagesData = await apiService.getMessages(contactId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // 处理新消息
  const handleNewMessage = async (message: Message) => {
    // 如果是当前聊天窗口的消息，直接添加到消息列表
    if (message.senderId === selectedContactId || message.receiverId === selectedContactId) {
      setMessages((prev) => [...prev, message]);
    }

    // 更新联系人的最后消息（只有当消息不是当前用户发送的时候才更新）
    if (message.senderId !== currentUser?.id) {
      const shouldIncrement = message.senderId !== selectedContactId;
      await updateContactLastMessage(message.senderId, message.content, shouldIncrement);
    }
  };

  // 更新联系人最后消息
  const updateContactLastMessage = async (contactId: string, lastMessage: string, incrementUnread: boolean = false) => {
    // 如果需要增加未读计数，从后端获取准确的未读数
    let actualUnreadCount: number | undefined;
    if (incrementUnread && currentUser) {
      try {
        const count = await apiService.getUnreadCountFromSender(currentUser.id, contactId);
        // 只有当count > 0时才设置，否则为undefined
        actualUnreadCount = count > 0 ? count : undefined;
      } catch (error) {
        console.error('Failed to get unread count:', error);
      }
    }

    setContacts((prev) => {
      const updated = prev.map((c) => {
        if (c.id === contactId) {
          const newContact = {
            ...c,
            lastMessage,
            lastMessageTime: new Date(),
          };

          // 只在需要更新未读数时才设置unreadCount
          if (incrementUnread) {
            if (actualUnreadCount !== undefined) {
              newContact.unreadCount = actualUnreadCount;
            } else {
              // API调用失败时回退到+1逻辑，但如果结果是0则不设置
              const fallbackCount = (c.unreadCount || 0) + 1;
              newContact.unreadCount = fallbackCount > 0 ? fallbackCount : undefined;
            }
          }

          return newContact;
        }
        return c;
      });

      // 重新排序，将有消息的联系人按时间排在前面
      return updated.sort((a: any, b: any) => {
        if (a.lastMessageTime && b.lastMessageTime) {
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        }
        if (a.lastMessageTime) return -1;
        if (b.lastMessageTime) return 1;
        return 0;
      });
    });
  };

  // 更新联系人状态
  const updateContactStatus = (contactId: string, status: Contact['status']) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status } : c))
    );
  };

  // 登录处理
  const handleLogin = async (user: User) => {
    // LoginPage 已经完成了登录和token保存，这里只需要设置用户状态并加载数据
    setCurrentUser(user);
    try {
      await loadContacts(user.id);
      connectWebSocket(user.id);
    } catch (error) {
      console.error('Failed to load contacts after login:', error);
      toast.error('加载联系人失败，请刷新页面');
    }
  };

  // 登出处理
  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      apiService.disconnectWebSocket();
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
      setContacts([]);
      setMessages([]);
      setSelectedContactId(null);
    }
  };

  // 选择联系人
  const handleSelectContact = async (contactId: string) => {
    setSelectedContactId(contactId);
    loadMessages(contactId);

    // 立即清除前端显示的未读计数
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unreadCount: undefined } : c))
    );

    // 标记与该联系人的所有消息为已读
    if (currentUser) {
      try {
        await apiService.markPrivateMessagesAsRead(contactId, currentUser.id);
        // 标记成功后，重新加载联系人列表以确保状态同步
        // 注意：这里不重新加载整个列表，只更新当前联系人的未读数为0
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  };

  // 发送消息
  const handleSendMessage = async (
    content: string,
    type: 'text' | 'file' | 'image',
    file?: File
  ) => {
    if (!currentUser || !selectedContactId) return;

    try {
      let messageData;
      if (file) {
        messageData = await apiService.uploadFile(file, selectedContactId);
      } else {
        messageData = await apiService.sendMessage(selectedContactId, content, type);
      }

      const newMessage: Message = {
        id: messageData.id || Date.now().toString(),
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
        type,
        status: 'sent',
        fileUrl: messageData.fileUrl,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize,
      };

      setMessages((prev) => [...prev, newMessage]);
      updateContactLastMessage(selectedContactId, content);

      // 通过 WebSocket 发送
      apiService.sendWebSocketMessage({
        type: 'message',
        message: newMessage,
        recipientId: selectedContactId,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // 更新个人资料
  const handleUpdateProfile = async (name: string, username: string) => {
    try {
      const updatedUser = await apiService.updateProfile(name, username);
      setCurrentUser(updatedUser);
      toast.success('个人资料已更新');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('更新个人资料失败');
    }
  };

  // 发起视频通话
  const handleStartVideoCall = async () => {
    if (!selectedContactId) return;
    try {
      await apiService.initiateVideoCall(selectedContactId, false);
      setIsVoiceCall(false);
      setVideoCallOpen(true);
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  // 发起语音通话
  const handleStartVoiceCall = async () => {
    if (!selectedContactId) return;
    try {
      await apiService.initiateVideoCall(selectedContactId, true);
      setIsVoiceCall(true);
      setVideoCallOpen(true);
    } catch (error) {
      console.error('Failed to start voice call:', error);
    }
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const currentMessages = selectedContactId ? messages : [];

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 如果管理中心打开，显示管理中心
  if (adminCenterOpen && currentUser.isAdmin) {
    return <AdminCenter onClose={() => setAdminCenterOpen(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toaster position="top-right" />

      {/* 顶部导航栏 */}
      <header className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">企业通讯平台</h1>
              <p className="text-xs text-blue-100">Enterprise Communication</p>
            </div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            企业通讯平台
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 relative"
            onClick={() => setNotificationCenterOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-2 border-blue-600">
                {unreadNotifications}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          {currentUser.isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setAdminCenterOpen(true)}
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 联系人列表 */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
          <ContactList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
            currentUser={currentUser}
          />
        </div>

        {/* 聊天区域 */}
        <ChatArea
          contact={selectedContact || null}
          messages={currentMessages}
          currentUserId={currentUser.id}
          onSendMessage={handleSendMessage}
          onStartVideoCall={handleStartVideoCall}
          onStartVoiceCall={handleStartVoiceCall}
        />
      </div>

      {/* 设置对话框 */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* 管理员面板 */}
      {currentUser.isAdmin && (
        <AdminPanel
          open={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
        />
      )}

      {/* 通知中心 */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

      {/* 视频/语音通话 */}
      {selectedContact && (
        <VideoCallDialog
          open={videoCallOpen}
          onClose={() => setVideoCallOpen(false)}
          contactName={selectedContact.name}
          contactAvatar={selectedContact.avatar}
          isVoiceOnly={isVoiceCall}
        />
      )}
    </div>
  );
}

export default App;