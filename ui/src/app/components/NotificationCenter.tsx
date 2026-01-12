import React, { useState, useEffect } from 'react';
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
import { apiService } from '../services/api';
import { toast } from 'sonner';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  // 加载通知
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getNotifications();
      // 将 API 数据映射到组件需要的格式
      setNotifications(data.map(n => ({
        id: n.id,
        type: mapNotificationType(n.type),
        title: n.title,
        content: n.content,
        time: formatTime(n.timestamp),
        read: n.read,
        avatar: n.data?.avatar
      })));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('加载通知失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 映射通知类型
  const mapNotificationType = (type: string): Notification['type'] => {
    switch (type) {
      case 'message': return 'message';
      case 'approval': return 'system';
      case 'warning': return 'system';
      default: return 'system';
    }
  };

  // 格式化时间
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;

    const days = Math.floor(hours / 24);
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN');
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('标记失败');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('已全部标记为已读');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('操作失败');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('通知已删除');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('删除失败');
    }
  };


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
              onClick={handleMarkAllAsRead}
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
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
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
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
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
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        getIcon={getNotificationIcon}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>没有已读通知</p>
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
  getIcon: (type: Notification['type']) => React.ReactElement;
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

