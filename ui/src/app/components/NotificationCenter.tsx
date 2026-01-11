import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bell, 
  MessageSquare, 
  UserPlus, 
  FileText, 
  Video,
  Trash2,
  CheckCheck
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'friend_request' | 'file' | 'call' | 'system';
  title: string;
  content: string;
  time: string;
  read: boolean;
  avatar?: string;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: '张三',
      content: '发送了一条消息：您好，关于项目的进度...',
      time: '2分钟前',
      read: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
    },
    {
      id: '2',
      type: 'file',
      title: '李四',
      content: '发送了文件：项目需求文档.pdf',
      time: '15分钟前',
      read: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi'
    },
    {
      id: '3',
      type: 'call',
      title: '王五',
      content: '未接来电 (语音通话)',
      time: '1小时前',
      read: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu'
    },
    {
      id: '4',
      type: 'friend_request',
      title: '赵六',
      content: '请求添加您为好友',
      time: '3小时前',
      read: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu'
    },
    {
      id: '5',
      type: 'system',
      title: '系统通知',
      content: '您的账户安全设置已更新',
      time: '昨天',
      read: true
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'friend_request':
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case 'file':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'call':
        return <Video className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between pr-8">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知中心
            </SheetTitle>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-red-600">
                {unreadCount}
              </Badge>
            )}
          </div>
          <SheetDescription>
            查看您的所有通知和离线消息
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              全部标记为已读
            </Button>
          )}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                全部 ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                未读 ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">
                已读 ({readNotifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>暂无通知</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="mt-4">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>没有未读通知</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="mt-4">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2">
                  {readNotifications.length > 0 ? (
                    readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>暂无已读通知</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: Notification['type']) => JSX.Element;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, getIcon }: NotificationItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
        !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
      }`}
    >
      <div className="flex gap-3">
        {notification.avatar ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.avatar} alt={notification.title} />
            <AvatarFallback>{notification.title[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-sm">{notification.title}</div>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{notification.time}</span>
            <div className="flex gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  标为已读
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}