import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
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

interface ChatAreaProps {
  contact: Contact | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, type: 'text' | 'file' | 'image', file?: File) => void;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
}

export function ChatArea({ 
  contact, 
  messages, 
  currentUserId, 
  onSendMessage,
  onStartVideoCall,
  onStartVoiceCall
}: ChatAreaProps) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
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
    <div className="flex-1 flex flex-col bg-white">
      {/* 聊天头部 */}
      <div className="h-16 border-b px-6 flex items-center justify-between bg-white shadow-sm">
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

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
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
                      {message.content}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
      </ScrollArea>

      {/* 输入区域 */}
      <div className="border-t p-4 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="*/*"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="发送文件"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
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
    </div>
  );
}
