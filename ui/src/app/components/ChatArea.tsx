import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
//import { ScrollArea } from './ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  FileText,
  Download,
  Check,
  CheckCheck
} from 'lucide-react';
import { Contact } from './ContactList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { apiService } from '../services/api';

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
  fileId?: string;
  status: 'sending' | 'sent' | 'read';
}

interface ChatAreaProps {
  contact: Contact | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, type: 'text' | 'file' | 'image', file?: File) => void;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  discussionSpaces?: DiscussionSpace[];
  selectedDiscussionSpaceId?: string | null;
  onSelectDiscussionSpace?: (spaceId: string) => void;
  onCreateDiscussionSpace?: () => void;
  onAddDiscussionSpaceMember?: (spaceId: string, newMembers: string[]) => void;
  onRemoveDiscussionSpaceMember?: (spaceId: string, memberId: string) => void;
  currentUserRole?: string;
  contacts?: Contact[];
  onSelectContact?: (contactId: string) => void;
  mainGroupMessages?: Message[];
}

interface DiscussionSpace {
  id: string;
  name: string;
  groupId: string;
  creatorId: string;
  members: string[];
  createdAt: Date;
  description?: string;
}
export function ChatArea({
  contact, 
  messages, 
  currentUserId, 
  onSendMessage,
  onStartVideoCall,
  onStartVoiceCall,
  discussionSpaces = [],
  selectedDiscussionSpaceId = null,
  onSelectDiscussionSpace,
  onCreateDiscussionSpace,
  onAddDiscussionSpaceMember,
  onRemoveDiscussionSpaceMember,
  currentUserRole,
  contacts = [],
  onSelectContact: _onSelectContact,
  mainGroupMessages = []
}: ChatAreaProps) {  const [inputMessage, setInputMessage] = useState('');
  const [showReferenceDialog, setShowReferenceDialog] = useState(false);
  const [referenceableMessages, setReferenceableMessages] = useState<Message[]>([]);
  const [selectedReferenceMessages, setSelectedReferenceMessages] = useState<Message[]>([]);
  const [showAllReferences, setShowAllReferences] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当主群消息更新时，同步到讨论空间的可引用消息范围
  useEffect(() => {
    if (contact?.isGroup && selectedDiscussionSpaceId) {
      // 使用从父组件获取的主群消息
      setReferenceableMessages(mainGroupMessages);
    }
  }, [mainGroupMessages, contact, selectedDiscussionSpaceId]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage, 'text');
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      onSendMessage(file.name, type, file);
    }
  };

  const handleDownloadFile = async (message: Message) => {
    if (!message.fileId || !message.fileName) {
      console.error('Missing file information for download');
      return;
    }

    try {
      await apiService.downloadFile(message.fileId, message.fileName);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('文件下载失败，请稍后重试');
    }
  };

  const formatTime = (date: Date) => {
    // 确保转换为东八区（GMT+8）时间
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai'
    });
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">欢迎使用企业通讯平台</h3>
          <p className="text-gray-500">选择一个联系人开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* 聊天头部 */}
      <div className="h-16 border-b px-6 flex items-center justify-between bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>{contact.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{contact.name}</div>
            <div className="text-xs text-gray-500">
              {contact.status === 'online' ? '在线' : contact.status === 'busy' ? '忙碌' : '离线'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onStartVoiceCall}
            title="语音通话"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onStartVideoCall}
            title="视频通话"
          >
            <Video className="h-5 w-5" />
          </Button>
          {contact.isGroup && !selectedDiscussionSpaceId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateDiscussionSpace}
              title="创建讨论空间"
              disabled={!onCreateDiscussionSpace || (!currentUserRole || !['director', 'manager'].includes(currentUserRole))}
            >
              <span className="text-2xl">➕</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>查看资料</DropdownMenuItem>
              <DropdownMenuItem>聊天记录</DropdownMenuItem>
              <DropdownMenuItem>清空聊天</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 讨论空间标签页 */}
      {contact.isGroup && (
        <div className="border-b flex-shrink-0">
          <div className="flex overflow-x-auto px-4 gap-1">
            <button
              className={`px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors ${
                !selectedDiscussionSpaceId 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => selectedDiscussionSpaceId && onSelectDiscussionSpace?.(null as any)}
            >
              主群聊
            </button>
            {discussionSpaces.map((space) => (
              <button
                key={space.id}
                className={`px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedDiscussionSpaceId === space.id 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => onSelectDiscussionSpace?.(space.id)}
              >
                {space.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 讨论空间成员显示 */}
      {contact.isGroup && selectedDiscussionSpaceId && (
        <div className="bg-gray-50 border-b px-4 py-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">空间成员：</span>
            <div className="flex gap-4">
              {discussionSpaces.find(space => space.id === selectedDiscussionSpaceId)?.members.map((memberId) => {
                const member = contacts.find(c => c.id === memberId);
                const isCurrentUser = memberId === currentUserId;
                return (
                  <div
                    key={memberId}
                    className="flex flex-col items-center hover:opacity-80 transition-opacity relative"
                  >
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={member?.avatar} alt={member?.name} />
                      <AvatarFallback>{member?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs mt-1 text-gray-600">{member?.name || '未知用户'}</span>
                    {/* 删除成员按钮，只有部门主管及以上权限者可以看到，且不能删除自己 */}
                    {(['director', 'admin']).includes(currentUserRole || '') && !isCurrentUser && (
                      <button
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        onClick={() => {
                          if (confirm(`确定要将 ${member?.name || '该成员'} 从讨论空间中移除吗？`)) {
                            onRemoveDiscussionSpaceMember?.(selectedDiscussionSpaceId!, memberId);
                          }
                        }}
                        title="移除成员"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
              {/* 添加成员按钮，只有部门主管及以上权限者可以看到 */}
              {(['director', 'admin']).includes(currentUserRole || '') && (
                <div
                  className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => {
                    setSelectedNewMembers([]);
                    setShowAddMemberDialog(true);
                  }}
                >
                  <div className="h-8 w-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-white">
                    <span className="text-xs text-gray-500">+</span>
                  </div>
                  <span className="text-xs mt-1 text-gray-500">添加</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-6" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={isCurrentUser ? '' : contact.avatar} 
                    alt={isCurrentUser ? 'You' : contact.name} 
                  />
                  <AvatarFallback>
                    {isCurrentUser ? 'Me' : contact.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-md ${isCurrentUser ? 'items-end' : ''}`}>
                  {message.type === 'text' && (
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-900 rounded-tl-none'
                      }`}
                    >
                      {message.content.includes('引用 ') ? (
                        <div className="space-y-3">
                          {/* 检查是否有多个引用消息 */}
                          {message.content.split('引用 ').length > 4 || message.content.length > 500 ? (
                            <div>
                              {showAllReferences ? (
                                <>
                                  <div className={`border-l-4 ${isCurrentUser ? 'border-blue-300' : 'border-gray-400'} pl-3 space-y-3`}>
                                    {message.content.split('引用 ').map((ref, index) => {
                                      if (index === 0) return null;
                                      return (
                                        <div key={index} className="text-sm">
                                          <span className={`font-medium ${isCurrentUser ? 'text-blue-200' : 'text-gray-600'}`}>引用:</span> {ref}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <button
                                    className={`text-xs mt-2 inline-block ${isCurrentUser ? 'text-blue-200' : 'text-blue-500'} hover:underline`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAllReferences(false);
                                    }}
                                  >
                                    收起引用
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className={`border-l-4 ${isCurrentUser ? 'border-blue-300' : 'border-gray-400'} pl-3`}>
                                    <div className="text-sm">
                                      <span className={`font-medium ${isCurrentUser ? 'text-blue-200' : 'text-gray-600'}`}>引用:</span> {message.content.split('引用 ')[1]}
                                    </div>
                                  </div>
                                  <span className={`${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}>...</span>
                                  <button
                                    className={`text-xs mt-2 inline-block ${isCurrentUser ? 'text-blue-200' : 'text-blue-500'} hover:underline`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAllReferences(true);
                                    }}
                                  >
                                    查看全部引用 ({message.content.split('引用 ').length - 1}条)
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className={`border-l-4 ${isCurrentUser ? 'border-blue-300' : 'border-gray-400'} pl-3 space-y-3`}>
                              {message.content.split('引用 ').map((ref, index) => {
                                if (index === 0) return null;
                                return (
                                  <div key={index} className="text-sm">
                                    <span className={`font-medium ${isCurrentUser ? 'text-blue-200' : 'text-gray-600'}`}>引用:</span> {ref}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  )}
                  {message.type === 'file' && (
                    <div
                      className={`px-4 py-3 rounded-2xl border ${
                        isCurrentUser
                          ? 'bg-blue-50 border-blue-200 rounded-tr-none'
                          : 'bg-gray-50 border-gray-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{message.fileName}</div>
                          <div className="text-xs text-gray-500">{message.fileSize}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownloadFile(message)}
                          title="下载文件"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {message.type === 'image' && (
                    <div
                      className={`rounded-2xl overflow-hidden ${
                        isCurrentUser ? 'rounded-tr-none' : 'rounded-tl-none'
                      }`}
                    >
                      <img
                        src={message.fileUrl || 'https://via.placeholder.com/300x200'}
                        alt={message.fileName}
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                    {isCurrentUser && (
                      <span>
                        {message.status === 'read' ? (
                          <CheckCheck className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Check className="h-3 w-3 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="*/*"
              title="发送文件"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="发送文件"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            {contact?.isGroup && selectedDiscussionSpaceId && (
              <Button
                variant="ghost"
                size="icon"
                title="引用主群聊内容"
                onClick={() => setShowReferenceDialog(true)}
              >
                <span className="text-2xl">📎</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" title="表情">
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1">
            <Input
              placeholder="输入消息..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="resize-none"
            />
          </div>
          <Button 
            onClick={handleSend}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Send className="h-4 w-4 mr-2" />
            发送
          </Button>
        </div>
      </div>
      {/* 引用主群聊消息对话框 */}
      {showReferenceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">引用主群聊消息</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // 清空选择
                    setSelectedReferenceMessages([]);
                  }}
                >
                  清空
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // 全选所有消息
                    setSelectedReferenceMessages(referenceableMessages);
                  }}
                >
                  全选
                </Button>
                <Button
                  size="sm"
                  disabled={selectedReferenceMessages.length === 0}
                  onClick={() => {
                    if (selectedReferenceMessages.length > 0) {
                      setShowReferenceDialog(false);
                      // 构建引用消息的格式
                      let referenceText = '';
                      selectedReferenceMessages.forEach((message) => {
                        const sender = contacts.find(c => c.id === message.senderId);
                        referenceText += `引用 ${sender?.name || '未知用户'}：\n${message.content}\n\n`;
                      });
                      // 直接发送引用消息，而不是先添加到输入框
                      if (referenceText.trim()) {
                        onSendMessage(referenceText.trim(), 'text');
                      }
                      // 清空选中的消息
                      setSelectedReferenceMessages([]);
                    }
                  }}
                >
                  确认引用 ({selectedReferenceMessages.length})
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowReferenceDialog(false);
                    // 清空选中的消息
                    setSelectedReferenceMessages([]);
                  }}
                >
                  <span className="text-xl">×</span>
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {referenceableMessages.length > 0 ? (
                  referenceableMessages.map((message) => {
                    const sender = contacts.find(c => c.id === message.senderId);
                    const isSelected = selectedReferenceMessages.some(m => m.id === message.id);
                    return (
                      <div
                        key={message.id}
                        className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedReferenceMessages(prev => prev.filter(m => m.id !== message.id));
                          } else {
                            setSelectedReferenceMessages(prev => [...prev, message]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{sender?.name || '未知用户'}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            } flex items-center justify-center`}>
                              {isSelected && <Check className="h-2 w-2 text-white" />}
                            </div>
                          </div>
                        </div>
                        {message.type === 'text' && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        {message.type === 'file' && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{message.fileName}</p>
                              <p className="text-xs text-gray-500">{message.fileSize}</p>
                            </div>
                          </div>
                        )}
                        {message.type === 'image' && (
                          <div className="mt-2">
                            <img
                              src={message.fileUrl || 'https://via.placeholder.com/200x150'}
                              alt={message.fileName}
                              className="max-w-full h-auto rounded"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">暂无可用的引用消息</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 添加讨论空间成员对话框 */}
      {showAddMemberDialog && selectedDiscussionSpaceId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">添加讨论空间成员</h3>
              <div className="flex items-center gap-2">
                {selectedNewMembers.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowAddMemberDialog(false);
                      // 添加新成员到讨论空间
                      onAddDiscussionSpaceMember?.(selectedDiscussionSpaceId, selectedNewMembers);
                      // 清空选中的成员
                      setSelectedNewMembers([]);
                    }}
                  >
                    确认添加 ({selectedNewMembers.length})
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAddMemberDialog(false);
                    // 清空选中的成员
                    setSelectedNewMembers([]);
                  }}
                >
                  <span className="text-xl">×</span>
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {contacts.length > 0 ? (
                  contacts.map((contact) => {
                    // 排除已经在讨论空间中的成员和群聊
                    const space = discussionSpaces.find(s => s.id === selectedDiscussionSpaceId);
                    const isAlreadyMember = space?.members.includes(contact.id) || false;
                    const isSelected = selectedNewMembers.includes(contact.id);
                    const isGroup = contact.isGroup;

                    if (isAlreadyMember || isGroup) return null;

                    return (
                      <div
                        key={contact.id}
                        className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedNewMembers(prev => prev.filter(id => id !== contact.id));
                          } else {
                            setSelectedNewMembers(prev => [...prev, contact.id]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback>{contact.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{contact.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          } flex items-center justify-center`}>
                            {isSelected && <Check className="h-2 w-2 text-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">暂无可用的成员</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
