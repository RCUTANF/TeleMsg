// ui/src/app/App.tsx
import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { ContactList, Contact } from './components/ContactList';
import { ChatArea, Message } from './components/ChatArea';
import { Button } from './components/ui/button';
import { NotificationCenter } from './components/NotificationCenter';
import { SettingsDialog } from './components/SettingsDialog';
// import { AdminDialog } from './components/AdminDialog';
import { VideoCallDialog } from './components/VideoCallDialog';
import { Bell, Settings, Shield, LogOut } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { apiService } from './services/api';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
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
      loadContacts();
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
  const loadContacts = async () => {
    try {
      const contactsData = await apiService.getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to load contacts:', error);
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
  const handleNewMessage = (message: Message) => {
    if (message.senderId === selectedContactId || message.senderId === currentUser?.id) {
      setMessages((prev) => [...prev, message]);
    }
    // 更新联系人的最后消息
    updateContactLastMessage(message.senderId, message.content);
  };

  // 更新联系人最后消息
  const updateContactLastMessage = (contactId: string, lastMessage: string) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, lastMessage, unreadCount: (c.unreadCount || 0) + 1 }
          : c
      )
    );
  };

  // 更新联系人状态
  const updateContactStatus = (contactId: string, status: Contact['status']) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status } : c))
    );
  };

  // 登录处理
  const handleLogin = async (user: User) => {
    try {
      const response = await apiService.login(user.username, 'password');
      localStorage.setItem('auth_token', response.token);
      setCurrentUser(response.user);
      loadContacts();
      connectWebSocket(response.user.id);
    } catch (error) {
      console.error('Login failed:', error);
      // 降级到本地模式
      setCurrentUser(user);
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
  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    loadMessages(contactId);
    // 清除未读计数
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unreadCount: 0 } : c))
    );
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
    } catch (error) {
      console.error('Failed to update profile:', error);
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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">IM</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            企业通讯平台
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>
          {currentUser.role === 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAdminOpen(true)}
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        <ContactList
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
          currentUser={currentUser}
        />
        <ChatArea
          contact={selectedContact || null}
          messages={messages}
          currentUserId={currentUser.id}
          onSendMessage={handleSendMessage}
          onStartVideoCall={handleStartVideoCall}
          onStartVoiceCall={handleStartVoiceCall}
        />
      </div>

      {/* 弹窗 */}
      <NotificationCenter
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
      />
      {/*{currentUser.role === 'admin' && (*/}
      {/*  <AdminDialog open={adminOpen} onClose={() => setAdminOpen(false)} />*/}
      {/*)}*/}
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