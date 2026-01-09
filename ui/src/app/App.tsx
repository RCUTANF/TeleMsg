import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { ContactList, Contact } from './components/ContactList';
import { ChatArea, Message } from './components/ChatArea';
import { SettingsDialog } from './components/SettingsDialog';
import { AdminPanel } from './components/AdminPanel';
import { NotificationCenter } from './components/NotificationCenter';
import { VideoCallDialog } from './components/VideoCallDialog';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 模拟联系人数据
  const [contacts] = useState<Contact[]>([
    {
      id: '2',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      status: 'online',
      lastMessage: '好的，明天见！',
      unreadCount: 2,
      lastSeen: '刚刚'
    },
    {
      id: '3',
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
      status: 'busy',
      lastMessage: '项目文档已发送',
      unreadCount: 0,
      lastSeen: '5分钟前'
    },
    {
      id: '4',
      name: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
      status: 'offline',
      lastMessage: '收到，谢谢',
      lastSeen: '2小时前'
    },
    {
      id: '5',
      name: '赵六',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
      status: 'online',
      lastSeen: '在线'
    },
    {
      id: '6',
      name: '孙七',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
      status: 'online',
      lastMessage: '明天的会议几点开始？',
      unreadCount: 1,
      lastSeen: '在线'
    }
  ]);

  // 模拟消息数据
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      content: '你好！最近项目进展怎么样了？',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: '1',
      content: '进展很顺利，已经完成了大部分功能开发。',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: '2',
      content: '太好了！能发一下最新的设计稿吗？',
      timestamp: new Date(Date.now() - 2400000),
      type: 'text',
      status: 'read'
    },
    {
      id: '4',
      senderId: '1',
      content: '项目设计稿_v2.pdf',
      timestamp: new Date(Date.now() - 1800000),
      type: 'file',
      fileName: '项目设计稿_v2.pdf',
      fileSize: '2.3 MB',
      status: 'read'
    },
    {
      id: '5',
      senderId: '2',
      content: '好的，明天见！',
      timestamp: new Date(Date.now() - 600000),
      type: 'text',
      status: 'sent'
    }
  ]);

  const unreadNotifications = 3; // 模拟未读通知数量

  const handleLogin = (user: User) => {
    setCurrentUser({ ...user, isAdmin: true }); // 第一个登录用户设为管理员
    toast.success(`欢迎回来，${user.name}！`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedContactId(null);
    toast.info('您已退出登录');
  };

  const handleSendMessage = (content: string, type: 'text' | 'file' | 'image', file?: File) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser!.id,
      content,
      timestamp: new Date(),
      type,
      status: 'sending'
    };

    if (file && type === 'file') {
      newMessage.fileName = file.name;
      newMessage.fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    }

    setMessages([...messages, newMessage]);

    // 模拟发送成功
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'sent' } : m
      ));
      
      if (type === 'text') {
        toast.success('消息已发送');
      } else if (type === 'file') {
        toast.success('文件已发送');
      } else {
        toast.success('图片已发送');
      }
    }, 500);
  };

  const handleStartVideoCall = () => {
    setIsVoiceCall(false);
    setVideoCallOpen(true);
    toast.info('正在发起视频通话...');
  };

  const handleStartVoiceCall = () => {
    setIsVoiceCall(true);
    setVideoCallOpen(true);
    toast.info('正在发起语音通话...');
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const currentMessages = selectedContactId ? messages : [];

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
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
              onClick={() => setAdminPanelOpen(true)}
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleLogout}
          >
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
            onSelectContact={setSelectedContactId}
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
        onUpdateProfile={(name, username) => {
          setCurrentUser({ ...currentUser, name, username });
          toast.success('个人资料已更新');
        }}
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