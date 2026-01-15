// ui/src/app/App.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
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

// Security policy type definition
interface SecurityPolicy {
  password: {
    minLength: string;
    requireLetters: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  login: {
    allowMultiDevice: boolean;
    maxDevices: string;
    ipRestriction: boolean;
    sessionTimeout: number;
  };
  content: {
    enableSensitiveWordFilter: boolean;
    enableFileScan: boolean;
    enableImageRecognition: boolean;
  };
  data: {
    enableEndToEndEncryption: boolean;
    enableAutoBackup: boolean;
    retentionDays: string;
  };
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

  // Security policy state
  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicy>({
    password: {
      minLength: '8',
      requireLetters: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
    login: {
      allowMultiDevice: true,
      maxDevices: '3',
      ipRestriction: false,
      sessionTimeout: 30,
    },
    content: {
      enableSensitiveWordFilter: true,
      enableFileScan: true,
      enableImageRecognition: false,
    },
    data: {
      enableEndToEndEncryption: true,
      enableAutoBackup: true,
      retentionDays: '365',
    },
  });

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

  // 处理 WebSocket 消息的引用，使用 ref 避免闭包问题
  const wsMessageHandlerRef = useRef<((data: any) => void) | null>(null);

  // 连接 WebSocket - 移除 ref 检查，直接传入 handler
  const connectWebSocket = useCallback((userId: string) => {
    console.log('📡 Setting up WebSocket connection for user:', userId);
    const handler = (data: any) => {
      console.log('📩 WebSocket message received in handler:', data);
      switch (data.type) {
        case 'message':
          console.log('💬 Processing message type:', data);
          // 使用最新的 ref 来处理消息
          if (wsMessageHandlerRef.current) {
            wsMessageHandlerRef.current(data);
          } else {
            console.warn('⚠️ wsMessageHandlerRef.current is null');
          }
          break;
        case 'contact_status':
          console.log('👤 Processing contact status update:', data);
          updateContactStatus(data.contactId, data.status);
          break;
        default:
          console.log('❓ Unknown message type:', data.type, data);
      }
    };
    apiService.connectWebSocket(userId, handler);
  }, []);

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

  // 当选择讨论空间时，加载该讨论空间的消息
  useEffect(() => {
    if (selectedDiscussionSpaceId) {
      loadDiscussionSpaceMessages(selectedDiscussionSpaceId);
    }
  }, [selectedDiscussionSpaceId]);

  // 加载讨论空间的消息
  const loadDiscussionSpaceMessages = async (spaceId: string) => {
    try {
      console.log('加载讨论空间消息:', spaceId);
      // 讨论空间也是一个群聊，使用群消息接口
      const messagesData = await apiService.getGroupMessages(spaceId);

      // 合并服务器消息和本地实时消息，去重
      setMessagesByDiscussionSpace(prev => {
        const existingMessages = prev[spaceId] || [];

        // 创建消息ID集合，用于去重
        const messageIdSet = new Set<string>();
        const mergedMessages: Message[] = [];

        // 首先添加服务器消息（优先级更高）
        messagesData.forEach((msg: Message) => {
          if (!messageIdSet.has(msg.id)) {
            messageIdSet.add(msg.id);
            mergedMessages.push(msg);
          }
        });

        // 然后添加本地实时消息中不重复的部分
        existingMessages.forEach(msg => {
          if (!messageIdSet.has(msg.id)) {
            messageIdSet.add(msg.id);
            mergedMessages.push(msg);
          }
        });

        // 按时间戳排序
        mergedMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return {
          ...prev,
          [spaceId]: mergedMessages
        };
      });

      console.log('讨论空间消息加载成功:', messagesData.length, '条');
    } catch (error) {
      console.error('Failed to load discussion space messages:', error);
    }
  };

  // ==========================================
  // 讨论空间处理函数
  // ==========================================


  const handleCreateDiscussionSpace = async (name: string, groupId: string, members: string[], description?: string) => {
    if (!currentUser) {
      console.error('当前用户未登录');
      toast.error('请先登录');
      return;
    }

    console.log('Creating discussion space:', { name, groupId, members, creatorId: currentUser.id, description });

    if (!name || !groupId || !members || members.length === 0) {
      console.error('创建讨论空间参数不完整:', { name, groupId, members });
      toast.error('参数不完整，请检查输入');
      return;
    }

    try {
      // 调用 API 创建讨论空间
      const newSpace = await apiService.createDiscussionSpace(name, groupId, members, currentUser.id, description);

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
      const errorMessage = error instanceof Error ? error.message : '创建讨论空间失败，请重试';
      toast.error(errorMessage);
    }
  };

  const handleCreateGroup = async (name: string, members: string[]) => {
    if (!currentUser) return;

    // 检查是否已存在同名群聊
    const existingGroup = contacts.find(c => c.isGroup && c.name === name);
    if (existingGroup) {
      toast.error(`已存在名为 "${name}" 的群聊，请使用其他名称`);
      return;
    }

    try {
      // 调用 API 创建群聊
      const groupData = await apiService.createGroup(name, '', currentUser.id);

      // 将其他成员加入群聊
      for (const memberId of members) {
        try {
          await apiService.joinGroup(groupData.groupId, memberId);
        } catch (error) {
          console.error(`Failed to add member ${memberId} to group:`, error);
        }
      }

      // 创建本地联系人对象
      const newGroup: Contact = {
        id: groupData.groupId,
        name: groupData.groupName,
        avatar: groupData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        status: 'online',
        isGroup: true,
        memberCount: members.length + 1, // 包含创建者
        role: 'owner'
      };

      setContacts([...contacts, newGroup]);
      toast.success(`群聊 "${name}" 已创建`);
    } catch (error) {
      console.error('Failed to create group:', error);

      // 针对权限错误给出友好提示
      if (error instanceof Error && (error.message.includes('权限') || error.message.includes('Forbidden'))) {
        toast.error('⚠️ ' + error.message, {
          duration: 5000,
          description: '请联系管理员或检查您的角色权限配置'
        });
      } else {
        toast.error('创建群聊失败，请重试');
      }
    }
  };

  const handleAddDiscussionSpaceMember = async (spaceId: string, newMembers: string[]) => {
    if (!currentUser) return;

    try {
      // 调用 API 添加成员
      const updatedSpace = await apiService.addDiscussionSpaceMembers(spaceId, currentUser.id, newMembers);

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
    if (!currentUser) return;

    try {
      // 调用 API 移除成员
      const updatedSpace = await apiService.removeDiscussionSpaceMember(spaceId, currentUser.id, memberId);

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

  const handleSaveSecurityPolicy = (policy: SecurityPolicy) => {
    setSecurityPolicy(policy);
    toast.success('安全策略已成功保存');
  };

  // 加载群组列表
  const loadGroups = async (userId: string) => {
    try {
      const groupMembers = await apiService.getUserGroups(userId);

      // 为每个群组获取详细信息
      const groupPromises = groupMembers.map(async (member: any) => {
        try {
          const groupInfo = await apiService.getGroupInfo(member.groupId);
          const members = await apiService.getGroupMembers(member.groupId);

          return {
            id: groupInfo.groupId,
            name: groupInfo.groupName,
            avatar: groupInfo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${groupInfo.groupName}`,
            status: 'online' as const,
            isGroup: true,
            memberCount: members.length,
            role: member.role.toLowerCase(),
            parentGroupId: groupInfo.parentGroupId // Add parentGroupId to identify discussion spaces
          };
        } catch (error) {
          console.error(`Failed to load group ${member.groupId}:`, error);
          return null;
        }
      });

      const groups = (await Promise.all(groupPromises)).filter(g => g !== null);
      return groups as Contact[];
    } catch (error) {
      console.error('Failed to load groups:', error);
      return [];
    }
  };

  // 加载联系人列表
  const loadContacts = async (userId?: string) => {
    try {
      const userIdToUse = userId || currentUser?.id;

      // 并行加载联系人和群组
      const [contactsData, groups] = await Promise.all([
        apiService.getContacts(),
        userIdToUse ? loadGroups(userIdToUse) : Promise.resolve([])
      ]);

      // 合并联系人和群组
      const allContacts = [...contactsData, ...groups];
      setContacts(allContacts);

      // 加载最近聊天记录
      if (userIdToUse) {
        await loadRecentChats(userIdToUse, allContacts);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };


  // 加载最近聊天记录并更新联系人
  const loadRecentChats = async (userId: string, contactsList: Contact[]) => {
    try {
      const recentMessages = await apiService.getRecentChats(userId);

      // 创建一个 Map 来存储每个联系人/群组的最后一条消息
      const lastMessageMap = new Map<string, { content: string; timestamp: Date; senderId: string }>();
      // 存储需要查询未读数的联系人ID（不包括群组）
      const contactIds = new Set<string>();
      // 存储群组ID
      const groupIds = new Set<string>();

      recentMessages.forEach((msg: any) => {
        let conversationId: string;

        // 判断是群聊还是私聊
        if (msg.groupId) {
          // 群聊消息
          conversationId = msg.groupId;
          groupIds.add(conversationId);
        } else {
          // 私聊消息 - 确定对话的另一方 ID
          conversationId = msg.senderId === userId ? msg.receiverId : msg.senderId;
          if (conversationId) {
            contactIds.add(conversationId);
          }
        }

        if (conversationId) {
          // 只保留最新的消息
          const existing = lastMessageMap.get(conversationId);
          if (!existing || msg.timestamp > existing.timestamp) {
            lastMessageMap.set(conversationId, {
              content: msg.content,
              timestamp: msg.timestamp,
              senderId: msg.senderId
            });
          }
        }
      });

      // 为每个私聊联系人查询未读消息数
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

      // 为每个群聊计算未读消息数（通过比对消息时间）
      for (const groupId of Array.from(groupIds)) {
        try {
          // 获取该群聊的所有消息
          const groupMessages = await apiService.getGroupMessages(groupId, 0, 100);

          // 获取本地存储的最后阅读时间
          const lastReadTimeStr = localStorage.getItem(`group_${groupId}_lastRead`);
          const lastReadTime = lastReadTimeStr ? new Date(lastReadTimeStr) : new Date(0);

          // 计算未读消息数量（发送时间晚于最后阅读时间且不是自己发的）
          const unreadCount = groupMessages.filter(msg =>
            msg.timestamp > lastReadTime && msg.senderId !== userId
          ).length;

          if (unreadCount > 0) {
            unreadCountMap.set(groupId, unreadCount);
          }
        } catch (error) {
          console.error(`Failed to get unread count for group ${groupId}:`, error);
          // 降级处理：如果最后一条消息不是自己发的，标记为有未读
          const lastMsg = lastMessageMap.get(groupId);
          if (lastMsg && lastMsg.senderId !== userId) {
            unreadCountMap.set(groupId, 1);
          }
        }
      }

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
      // 判断是否为群聊
      const selectedContact = contacts.find(c => c.id === contactId);
      const isGroupChat = selectedContact?.isGroup || false;

      let messagesData;
      if (isGroupChat) {
        // 获取群聊消息
        messagesData = await apiService.getGroupMessages(contactId);
      } else {
        // 获取私聊消息
        messagesData = await apiService.getMessages(contactId);
      }

      // 合并服务器消息和本地实时消息，去重
      setMessagesByContact(prev => {
        const existingMessages = prev[contactId] || [];

        // 创建消息ID集合，用于去重
        const messageIdSet = new Set<string>();
        const mergedMessages: Message[] = [];

        // 首先添加服务器消息（优先级更高，因为是持久化的）
        messagesData.forEach((msg: Message) => {
          if (!messageIdSet.has(msg.id)) {
            messageIdSet.add(msg.id);
            mergedMessages.push(msg);
          }
        });

        // 然后添加本地实时消息中不重复的部分
        existingMessages.forEach(msg => {
          if (!messageIdSet.has(msg.id)) {
            messageIdSet.add(msg.id);
            mergedMessages.push(msg);
          }
        });

        // 按时间戳排序
        mergedMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return {
          ...prev,
          [contactId]: mergedMessages
        };
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // 处理新消息
  const handleNewMessage = useCallback(async (messageData: any) => {
    console.log('🔔 Processing new message in handleNewMessage:', messageData);

    // 标准化消息格式
    const message: Message = {
      id: messageData.id || messageData.messageId || Date.now().toString(),
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      timestamp: messageData.timestamp instanceof Date ? messageData.timestamp : new Date(messageData.timestamp || new Date()),
      type: (messageData.type || messageData.messageType || 'text').toLowerCase() as 'text' | 'file' | 'image',
      status: messageData.status || 'sent',
      fileUrl: messageData.fileUrl || messageData.mediaUrl,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      fileId: messageData.fileId,
    };

    console.log('📝 Standardized message:', message);

    // 确定消息的对话 ID
    let conversationId: string;
    let isGroupMessage = false;

    // 判断是群聊还是私聊
    if (messageData.groupId) {
      // 群聊消息
      conversationId = messageData.groupId;
      isGroupMessage = true;
      console.log('👥 Group message detected. GroupId:', conversationId);
    } else {
      // 私聊消息（对方的 ID）
      conversationId = message.senderId === currentUser?.id ? message.receiverId! : message.senderId;
      console.log('💬 Private message detected. ConversationId:', conversationId);
    }

    if (!conversationId) {
      console.warn('⚠️ Cannot determine conversation ID for message:', message);
      return;
    }

    console.log('✅ Message conversation ID:', conversationId, 'isGroup:', isGroupMessage);

    // 使用函数式状态更新来避免闭包问题
    setDiscussionSpaces(currentSpaces => {
      const isDiscussionSpace = currentSpaces.some(space => space.id === conversationId);

      if (isDiscussionSpace) {
        // 讨论空间的消息 - 始终添加到消息列表中
        setMessagesByDiscussionSpace(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), message]
        }));
        // 注意：讨论空间的消息不更新父群聊的最后消息
      } else {
        // 主群聊或私聊消息 - 始终添加到消息列表中，无论是否正在查看
        setMessagesByContact(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), message]
        }));

        // 更新联系人的最后消息（只有当消息不是当前用户发送的时候才更新）
        setCurrentUser(user => {
          if (message.senderId !== user?.id) {
            const shouldIncrement = conversationId !== selectedContactId;
            updateContactLastMessage(conversationId, message.content, shouldIncrement, isGroupMessage);
          }
          return user;
        });
      }

      return currentSpaces;
    });
  }, [currentUser?.id, selectedContactId]);

  // 更新联系人最后消息
  const updateContactLastMessage = async (
    contactId: string,
    lastMessage: string,
    incrementUnread: boolean = false,
    isGroup: boolean = false
  ) => {
    // 如果需要增加未读计数
    let actualUnreadCount: number | undefined;
    if (incrementUnread && currentUser) {
      if (isGroup) {
        // 群聊：计算实际未读消息数量
        try {
          const groupMessages = await apiService.getGroupMessages(contactId, 0, 100);
          const lastReadTimeStr = localStorage.getItem(`group_${contactId}_lastRead`);
          const lastReadTime = lastReadTimeStr ? new Date(lastReadTimeStr) : new Date(0);

          const unreadCount = groupMessages.filter(msg =>
            msg.timestamp > lastReadTime && msg.senderId !== currentUser.id
          ).length;

          actualUnreadCount = unreadCount > 0 ? unreadCount : undefined;
        } catch (error) {
          console.error('Failed to get group unread count:', error);
          // 降级处理：使用简单计数
          actualUnreadCount = 1;
        }
      } else {
        // 私聊：从后端获取准确的未读数
        try {
          const count = await apiService.getUnreadCountFromSender(currentUser.id, contactId);
          // 只有当count > 0时才设置，否则为undefined
          actualUnreadCount = count > 0 ? count : undefined;
        } catch (error) {
          console.error('Failed to get unread count:', error);
        }
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
            } else if (!isGroup) {
              // 私聊且API调用失败时回退到+1逻辑
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
  const updateContactStatus = useCallback((contactId: string, status: Contact['status']) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status } : c))
    );
  }, []);

  // 设置 WebSocket 消息处理函数
  useEffect(() => {
    console.log('🔧 Setting up wsMessageHandlerRef');
    wsMessageHandlerRef.current = (data: any) => {
      console.log('🎯 Processing WebSocket data in handler ref:', data);
      // 直接调用 handleNewMessage，而不是再次检查 type
      handleNewMessage(data.message || data);
    };
    return () => {
      console.log('🔧 Cleaning up wsMessageHandlerRef');
    };
  }, [handleNewMessage]);

  // 登录处理
  const handleLogin = async (user: User) => {
    // LoginPage 已经完成了登录和token保存，这里只需要设置用户状态并加载数据
    setCurrentUser(user);
    try {
      await loadContacts(user.id);
      await loadDiscussionSpaces(); // 加载所有讨论空间
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

    // 判断是否为群聊
    const selectedContact = contacts.find(c => c.id === contactId);
    const isGroupChat = selectedContact?.isGroup || false;

    // 立即清除前端显示的未读计数
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unreadCount: undefined } : c))
    );

    if (isGroupChat) {
      // 群聊：保存当前时间为最后阅读时间
      localStorage.setItem(`group_${contactId}_lastRead`, new Date().toISOString());
    } else {
      // 私聊：标记与该联系人的所有消息为已读
      if (currentUser) {
        try {
          await apiService.markPrivateMessagesAsRead(contactId, currentUser.id);
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
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

    // 判断是否为群聊
    const selectedContact = contacts.find(c => c.id === selectedContactId);
    const isGroupChat = selectedContact?.isGroup || false;

    // 确定实际的接收者ID：如果在讨论空间中，使用讨论空间ID；否则使用联系人ID
    const actualReceiverId = selectedDiscussionSpaceId || selectedContactId;

    console.log('发送消息:', {
      selectedContactId,
      selectedDiscussionSpaceId,
      actualReceiverId,
      isGroupChat,
      content
    });

    try {
      let messageData;
      if (file) {
        // 发送文件消息
        if (isGroupChat || selectedDiscussionSpaceId) {
          // 群聊或讨论空间都使用群消息接口
          messageData = await apiService.sendGroupFileMessage(currentUser.id, actualReceiverId, file, content);
        } else {
          messageData = await apiService.sendFileMessage(actualReceiverId, file, content);
        }
      } else {
        // 发送文本消息
        if (isGroupChat || selectedDiscussionSpaceId) {
          // 群聊或讨论空间都使用群消息接口
          messageData = await apiService.sendGroupMessage(currentUser.id, actualReceiverId, content, type);
        } else {
          messageData = await apiService.sendMessage(actualReceiverId, content, type);
        }
      }

      const newMessage: Message = {
        id: messageData.id || Date.now().toString(),
        senderId: currentUser.id,
        receiverId: (isGroupChat || selectedDiscussionSpaceId) ? undefined : actualReceiverId,
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

      // 更新最后一条消息（只在主群聊或私聊时更新，讨论空间不更新父群聊的最后消息）
      if (!selectedDiscussionSpaceId) {
        updateContactLastMessage(
          selectedContactId,
          file ? `[${file.type.startsWith('image/') ? '图片' : '文件'}] ${file.name}` : content,
          false,
          isGroupChat
        );
      }

      // 通过 WebSocket 发送
      apiService.sendWebSocketMessage({
        type: 'message',
        message: newMessage,
        recipientId: actualReceiverId,  // 使用实际的接收者ID
      });

      console.log('消息发送成功:', newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);

      // 针对不同类型的错误给出友好提示
      let errorMessage = '发送消息失败';

      if (error instanceof Error) {
        const msg = error.message;

        // 检查是否是权限错误
        if (msg.includes('权限') || msg.includes('没有') || msg.includes('Forbidden')) {
          errorMessage = '⚠️ ' + msg;
          toast.error(errorMessage, {
            duration: 5000,
            description: '请联系管理员或检查您的角色权限配置'
          });
          return;
        }

        // 其他错误
        errorMessage = msg || '未知错误';
      }

      toast.error('发送失败：' + errorMessage);
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
    return <AdminCenter
        onClose={() => setAdminCenterOpen(false)}
        onSaveSecurityPolicy={handleSaveSecurityPolicy}
    />;
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
            onCreateGroup={handleCreateGroup}
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
        onChangePassword={async (oldPassword: string, newPassword: string) => {
          try {
            await apiService.changePassword(currentUser.id, oldPassword, newPassword);
            toast.success('密码修改成功');
          } catch (error: any) {
            console.error('修改密码失败:', error);
            toast.error('密码修改失败: ' + (error.message || '请重试'));
            throw error; // Re-throw to let SettingsDialog handle it
          }
        }}
        securityPolicy={securityPolicy}
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
      {selectedContact && selectedContact.isGroup && !selectedContact.parentGroupId && (
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