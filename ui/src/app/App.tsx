// ui/src/app/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { ContactList, Contact } from './components/ContactList';
import { ChatArea, Message } from './components/ChatArea';
import { SettingsDialog } from './components/SettingsDialog';
import { AdminPanel } from './components/AdminPanel';
import { AdminCenter } from './components/AdminCenter';
import { VideoCallDialog } from './components/VideoCallDialog';
import { DiscussionSpaceDialog } from './components/DiscussionSpaceDialog';
import { Button } from './components/ui/button';
import { Settings, Shield, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from './services/api';
import { Toaster } from './components/ui/sonner';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
  role?: string; // For role-based access: 'director', 'manager', 'employee'
}

interface DiscussionSpace {
  id: string;
  name: string;
  groupId: string; // The group chat this space belongs to
  creatorId: string;
  members: string[]; // User IDs
  createdAt: Date;
  description?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDiscussionSpaceId, setSelectedDiscussionSpaceId] = useState<string | null>(null);
  const [discussionSpaces, setDiscussionSpaces] = useState<DiscussionSpace[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminCenterOpen, setAdminCenterOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [createDiscussionSpaceOpen, setCreateDiscussionSpaceOpen] = useState(false);
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>({});

  // 为每个讨论空间分别存储消息
  const [messagesByDiscussionSpace, setMessagesByDiscussionSpace] = useState<Record<string, Message[]>>({
    // 讨论空间的消息会在这里存储
  });

  // 为每个讨论空间存储成员加入时间
  const [_memberJoinTimes, setMemberJoinTimes] = useState<Record<string, Record<string, Date>>>({
    // 格式: { spaceId: { memberId: joinTime } }
  });

  // ==========================================
  // API 加载函数
  // ==========================================

  // 加载讨论空间列表
  const loadDiscussionSpaces = useCallback(async (groupId?: string) => {
    try {
      const spaces = await apiService.getDiscussionSpaces(groupId);
      setDiscussionSpaces(spaces);
    } catch (error) {
      console.error('Failed to load discussion spaces:', error);
    }
  }, []);

  // 加载当前用户
  const loadCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      await loadContacts(user.id);
      await loadDiscussionSpaces(); // 加载所有讨论空间
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
      case 'contact_status':
        updateContactStatus(data.contactId, data.status);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // ==========================================
  // useEffect 钩子
  // ==========================================

  // 初始化 - 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当选择联系人时，如果是群组则重新加载该群组的讨论空间
  useEffect(() => {
    if (selectedContactId) {
      const selectedContact = contacts.find(c => c.id === selectedContactId);
      if (selectedContact?.isGroup) {
        loadDiscussionSpaces(selectedContactId);
      }
    }
  }, [selectedContactId, contacts, loadDiscussionSpaces]);

  // ==========================================
  // 讨论空间处理函数
  // ==========================================


  const handleCreateDiscussionSpace = async (name: string, groupId: string, members: string[], description?: string) => {
    if (!currentUser) return;

    try {
      // 调用 API 创建讨论空间
      const newSpace = await apiService.createDiscussionSpace(name, groupId, members, description);

      // 更新本地状态
      setDiscussionSpaces([...discussionSpaces, newSpace]);

      // 记录成员加入时间
      const joinTimes: Record<string, Date> = {};
      members.forEach(memberId => {
        joinTimes[memberId] = new Date();
      });
      setMemberJoinTimes(prev => ({
        ...prev,
        [newSpace.id]: joinTimes
      }));

      toast.success(`讨论空间 "${name}" 已创建`);
    } catch (error) {
      console.error('Failed to create discussion space:', error);
      toast.error('创建讨论空间失败，请重试');
    }
  };

  const handleAddDiscussionSpaceMember = async (spaceId: string, newMembers: string[]) => {
    try {
      // 调用 API 添加成员
      const updatedSpace = await apiService.addDiscussionSpaceMembers(spaceId, newMembers);

      // 更新本地状态
      setDiscussionSpaces(discussionSpaces.map(space =>
        space.id === spaceId ? updatedSpace : space
      ));

      // 为新成员记录加入时间
      setMemberJoinTimes(prev => {
        const spaceJoinTimes = prev[spaceId] || {};
        const updatedJoinTimes = { ...spaceJoinTimes };

        newMembers.forEach(memberId => {
          if (!updatedJoinTimes[memberId]) {
            updatedJoinTimes[memberId] = new Date();
          }
        });

        return {
          ...prev,
          [spaceId]: updatedJoinTimes
        };
      });

      toast.success(`已添加 ${newMembers.length} 位新成员到讨论空间`);
    } catch (error) {
      console.error('Failed to add members:', error);
      toast.error('添加成员失败，请重试');
    }
  };

  const handleRemoveDiscussionSpaceMember = async (spaceId: string, memberId: string) => {
    try {
      // 调用 API 移除成员
      const updatedSpace = await apiService.removeDiscussionSpaceMember(spaceId, memberId);

      // 更新本地状态
      setDiscussionSpaces(discussionSpaces.map(space =>
        space.id === spaceId ? updatedSpace : space
      ));

      // 移除成员加入时间记录
      setMemberJoinTimes(prev => {
        const spaceJoinTimes = prev[spaceId] || {};
        const updatedJoinTimes = { ...spaceJoinTimes };
        delete updatedJoinTimes[memberId];

        return {
          ...prev,
          [spaceId]: updatedJoinTimes
        };
      });

      toast.success('已从讨论空间移除成员');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('移除成员失败，请重试');
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
      setMessagesByContact(prev => ({
        ...prev,
        [contactId]: messagesData
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // 处理新消息
  const handleNewMessage = async (message: Message) => {
    // 确定消息的对话 ID（对方的 ID）
    const conversationId = message.senderId === currentUser?.id ? message.receiverId : message.senderId;

    if (!conversationId) return;

    // 如果是当前聊天窗口的消息，添加到对应的消息列表
    if (conversationId === selectedContactId) {
      setMessagesByContact(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message]
      }));
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
      setMessagesByContact({});
      setMessagesByDiscussionSpace({});
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
        // 发送文件消息
        messageData = await apiService.sendFileMessage(selectedContactId, file, content);
      } else {
        // 发送文本消息
        messageData = await apiService.sendMessage(selectedContactId, content, type);
      }

      const newMessage: Message = {
        id: messageData.id || Date.now().toString(),
        senderId: currentUser.id,
        receiverId: selectedContactId,
        content: messageData.content || content,
        timestamp: new Date(messageData.timestamp || new Date()),
        type: messageData.type || type,
        status: 'sent',
        fileUrl: messageData.fileUrl,
        fileName: messageData.fileName,
        fileSize: messageData.fileSize,
        ...((messageData as any).fileId && { fileId: (messageData as any).fileId }),
      };

        if (selectedDiscussionSpaceId) {
            // 在讨论空间中发送的消息，存储在独立的讨论空间消息存储中
            setMessagesByDiscussionSpace(prev => ({
                ...prev,
                [selectedDiscussionSpaceId]: [
                    ...(prev[selectedDiscussionSpaceId] || []),
                    newMessage
                ]
            }));
        } else {
            // 在主群或一对一聊天中发送的消息，存储在联系人消息存储中
            setMessagesByContact(prev => ({
                ...prev,
                [selectedContactId]: [
                    ...(prev[selectedContactId] || []),
                    newMessage
                ]
            }));
        }

      updateContactLastMessage(selectedContactId, file ? `[${file.type.startsWith('image/') ? '图片' : '文件'}] ${file.name}` : content);

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

  // 更新代理设置
  const handleUpdateProxySettings = async (settings: {
    enabled: boolean;
    host: string;
    port: string;
    type: string;
  }) => {
    try {
      // 保存代理设置到本地存储
      localStorage.setItem('proxySettings', JSON.stringify(settings));

      // 如果有API端点，也可以保存到服务器
      // await apiService.updateProxySettings(settings);

      toast.success('代理设置已保存');
    } catch (error) {
      console.error('Failed to update proxy settings:', error);
      toast.error('保存代理设置失败');
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
  // 如果选择了讨论空间，使用讨论空间的消息；否则使用联系人的消息
  const currentMessages = selectedDiscussionSpaceId
    ? (() => {
        const spaceMessages = messagesByDiscussionSpace[selectedDiscussionSpaceId] || [];
        const space = discussionSpaces.find(s => s.id === selectedDiscussionSpaceId);
        const isMember = space && currentUser?.id ? space.members.includes(currentUser.id) : false;

        // 只有空间成员可以查看消息
        return isMember ? spaceMessages : [];
      })()
    : (selectedContactId ? (messagesByContact[selectedContactId] || []) : []);

  // 当消息更新时，更新对应联系人的最后一条消息
  useEffect(() => {
    if (selectedContactId && currentMessages.length > 0 && !selectedDiscussionSpaceId) {
      // 只有在主群或一对一聊天中才更新联系人的最后一条消息，讨论空间的消息不影响主群显示
      const lastMessage = currentMessages[currentMessages.length - 1];
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === selectedContactId
            ? {
                ...contact,
                lastMessage: lastMessage.type === 'text'
                  ? lastMessage.content
                  : lastMessage.type === 'file'
                    ? '发送了一个文件'
                    : '发送了一张图片'
              }
            : contact
        )
      );
    }
  }, [currentMessages, selectedContactId, selectedDiscussionSpaceId]);
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
            onSelectContact={handleSelectContact}
            currentUser={currentUser}
            messagesByContact={messagesByContact}
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
          discussionSpaces={selectedContact?.isGroup ? discussionSpaces.filter(space => space.groupId === selectedContact.id) : []}
          selectedDiscussionSpaceId={selectedDiscussionSpaceId}
          onSelectDiscussionSpace={(spaceId) => setSelectedDiscussionSpaceId(spaceId)}
          onCreateDiscussionSpace={() => selectedContact?.isGroup && setCreateDiscussionSpaceOpen(true)}
          onAddDiscussionSpaceMember={handleAddDiscussionSpaceMember}
          onRemoveDiscussionSpaceMember={handleRemoveDiscussionSpaceMember}
          currentUserRole={currentUser.role}
          contacts={contacts}
          onSelectContact={setSelectedContactId}
          mainGroupMessages={selectedContact?.isGroup ? (messagesByContact[selectedContact.id] || []) : []}
        />
      </div>

      {/* 设置对话框 */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onUpdateProxySettings={handleUpdateProxySettings}
      />

      {/* 管理员面板 */}
      {currentUser.isAdmin && (
        <AdminPanel
          open={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
        />
      )}

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

      {/* 讨论空间创建对话框 */}
      {selectedContact && selectedContact.isGroup && (
        <DiscussionSpaceDialog
          open={createDiscussionSpaceOpen}
          onClose={() => setCreateDiscussionSpaceOpen(false)}
          group={selectedContact}
          currentUserId={currentUser.id}
          onCreate={handleCreateDiscussionSpace}
        />
      )}
    </div>
  );
}

export default App;