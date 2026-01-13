import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Users, MessageCircle, X, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  lastSeen?: string;
  isGroup?: boolean;
  memberCount?: number;
  role?: string; // For group chats: 'owner', 'admin', 'member'
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
  status: 'sending' | 'sent' | 'read';
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  currentUser: { id: string; name: string; username: string; avatar: string };
  messagesByContact?: Record<string, Message[]>;
}

export function ContactList({ contacts, selectedContactId, onSelectContact, currentUser, messagesByContact = {} }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'contacts' | 'messages'>('all');

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500'
  };

  // const recentChats = contacts.filter(c => c.lastMessage);
  const recentChats = contacts.filter(c => typeof c.lastMessage === 'string' && c.lastMessage.trim() !== ''); // 只显示有聊天记录的联系人


  // 搜索逻辑
  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    // 检查联系人名称
    if (contact.name.toLowerCase().includes(query)) {
      return true;
    }

    // 检查最后一条消息
    if (contact.lastMessage && contact.lastMessage.toLowerCase().includes(query)) {
      return true;
    }

    // 检查该联系人的所有消息内容
    const contactMessages = messagesByContact[contact.id];
    if (contactMessages) {
      return contactMessages.some(message => {
        // 检查文本消息内容
        if (message.type === 'text' && message.content.toLowerCase().includes(query)) {
          return true;
        }
        // 检查文件名称
        if (message.fileName && message.fileName.toLowerCase().includes(query)) {
          return true;
        }
        return false;
      });
    }

    return false;
  });

  const clearSearch = () => {
    setSearchQuery('');
    setSearchMode('all');
  };
  // 格式化时间显示
  const formatTime = (date?: Date) => {
    if (!date) return '';

    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInHours < 24) return `${diffInHours}小时前`;
    if (diffInDays === 1) return '昨天';
    if (diffInDays < 7) return `${diffInDays}天前`;

    return messageDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="w-80 border-r bg-gray-50/50 flex flex-col h-full">
      {/* 用户信息头部 */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{currentUser.name}</div>
            <div className="text-xs text-gray-500 truncate">账号: {currentUser.username}</div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索联系人或消息..."
            className="pl-10 bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={clearSearch}
              title="清除搜索"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="flex gap-2 mt-2">
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                searchMode === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSearchMode('all')}
            >
              全部
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                searchMode === 'contacts' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSearchMode('contacts')}
            >
              联系人
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                searchMode === 'messages' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSearchMode('messages')}
            >
              消息
            </button>
          </div>
        )}
      </div>

      {/* 联系人列表 */}
      <Tabs defaultValue="chats" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-white">
          <TabsTrigger value="chats" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>聊天</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" />
            <span>联系人</span>
          </TabsTrigger>
        </TabsList>

        {/* 搜索结果显示 */}
        {searchQuery && (
            <div className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-4 border-b bg-white">
                  <div className="font-semibold text-sm">搜索结果 ({filteredContacts.length})</div>
                </div>
                <div className="divide-y">
                  {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => {
                        // 高亮搜索匹配的文本
                        const highlightText = (text: string) => {
                          if (!searchQuery) return text;
                          const query = searchQuery.toLowerCase();
                          const index = text.toLowerCase().indexOf(query);
                          if (index === -1) return text;
                          return (
                              <>
                                {text.substring(0, index)}
                                <span className="bg-yellow-100 text-yellow-800">{text.substring(index, index + searchQuery.length)}</span>
                                {text.substring(index + searchQuery.length)}
                              </>
                          );
                        };

                        return (
                            <button
                                key={contact.id}
                                onClick={() => {
                                  onSelectContact(contact.id);
                                  clearSearch();
                                }}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors ${
                                    selectedContactId === contact.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                }`}
                            >
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={contact.avatar} alt={contact.name} />
                                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[contact.status]}`} />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{highlightText(contact.name)}</span>
                                  {contact.isGroup && (
                                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                        {contact.memberCount}人
                                      </Badge>
                                  )}
                                </div>
                                {/* 显示所有匹配的内容 */}
                                {(() => {
                                  if (!searchQuery) return null;
                                  const query = searchQuery.toLowerCase();

                                  // 定义匹配项类型
                                  type MatchedItem =
                                      | { type: 'file'; content: string; fileSize?: string }
                                      | { type: 'text'; content: string };

                                  // 收集所有匹配的消息和文件
                                  const matchedItems: MatchedItem[] = [];

                                  // 检查消息中的文件名称和消息内容
                                  const contactMessages = messagesByContact[contact.id];
                                  if (contactMessages) {
                                    contactMessages.forEach(message => {
                                      // 检查文件名称
                                      if (message.fileName && message.fileName.toLowerCase().includes(query)) {
                                        matchedItems.push({
                                          type: 'file' as const,
                                          content: message.fileName,
                                          fileSize: message.fileSize
                                        });
                                      }
                                      // 检查消息内容（仅文本消息）
                                      if (message.type === 'text' && message.content.toLowerCase().includes(query)) {
                                        matchedItems.push({
                                          type: 'text' as const,
                                          content: message.content
                                        });
                                      }
                                    });
                                  }

                                  // 如果有匹配的内容，显示所有匹配项（最多显示5条）
                                  if (matchedItems.length > 0) {
                                    const maxDisplay = 5;
                                    const displayItems = matchedItems.slice(0, maxDisplay);
                                    const hasMore = matchedItems.length > maxDisplay;

                                    return (
                                        <div className="space-y-1">
                                          {displayItems.map((item, index) => (
                                              <p key={index} className="text-xs text-gray-500 truncate">
                                                {item.type === 'file' ? (
                                                    <>
                                                      <FileText className="h-3 w-3 inline mr-1" />
                                                      {highlightText(item.content)}
                                                      {item.fileSize && <span className="text-gray-400 ml-1">({item.fileSize})</span>}
                                                    </>
                                                ) : (
                                                    <>
                                                      <MessageCircle className="h-3 w-3 inline mr-1" />
                                                      <span className="truncate">{highlightText(item.content)}</span>
                                                    </>
                                                )}
                                              </p>
                                          ))}
                                          {hasMore && (
                                            <p className="text-xs text-blue-600 font-medium">
                                              还有 {matchedItems.length - maxDisplay} 条匹配消息...
                                            </p>
                                          )}
                                        </div>
                                    );
                                  }

                                  // 如果只匹配了名称，显示状态
                                  return (
                                      <p className="text-xs text-gray-500">
                                        {contact.status === 'online' ? '在线' : contact.status === 'busy' ? '忙碌' : '离线'}
                                      </p>
                                  );
                                })()}
                              </div>
                            </button>
                        );
                      })
                  ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">未找到匹配的结果</p>
                        <button
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            onClick={clearSearch}
                        >
                          清除搜索
                        </button>
                      </div>
                  )}
                </div>
              </ScrollArea>
            </div>
        )}
        {/* 正常聊天列表 */}
        {!searchQuery && (
            <>
        <TabsContent value="chats" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="divide-y">
              {recentChats.length > 0 ? (
                recentChats.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => onSelectContact(contact.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-100 transition-colors ${
                      selectedContactId === contact.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[contact.status]}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate">{contact.name}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-500 truncate flex-1">{contact.lastMessage}</p>
                        {contact.unreadCount && contact.unreadCount > 0 && (
                          <Badge
                            variant="default"
                            className="ml-auto bg-red-500 hover:bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full flex-shrink-0"
                          >
                            {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">暂无聊天记录</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="contacts" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="divide-y">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                    selectedContactId === contact.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[contact.status]}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{contact.name}</div>
                    <div className="text-xs text-gray-500">
                      {contact.status === 'online' ? '在线' : contact.status === 'busy' ? '忙碌' : `上次在线：${contact.lastSeen || '未知'}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
            </>
            )}
      </Tabs>
    </div>
  );
}