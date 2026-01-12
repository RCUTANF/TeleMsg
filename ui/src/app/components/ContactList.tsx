import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Users, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastMessage?: string;
  unreadCount?: number;
  lastSeen?: string;
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  currentUser: { id: string; name: string; username: string; avatar: string };
}

export function ContactList({ contacts, selectedContactId, onSelectContact, currentUser }: ContactListProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500'
  };

  const recentChats = contacts.filter(c => c.lastMessage);

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
          />
        </div>
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
                        {typeof contact.unreadCount === 'number' && contact.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 bg-red-600 text-white">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
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
      </Tabs>
    </div>
  );
}