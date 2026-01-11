import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { 
  Shield, 
  Users, 
  Settings, 
  UserPlus, 
  Trash2, 
  Edit,
  Search,
  BarChart3
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'suspended';
  avatar: string;
  lastActive: string;
}

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AdminPanel({ open, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '张三',
      username: 'zhangsan',
      role: 'admin',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      lastActive: '2分钟前'
    },
    {
      id: '2',
      name: '李四',
      username: 'lisi',
      role: 'user',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
      lastActive: '1小时前'
    },
    {
      id: '3',
      name: '王五',
      username: 'wangwu',
      role: 'user',
      status: 'inactive',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
      lastActive: '3天前'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const roleColors = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    user: 'bg-blue-100 text-blue-700 border-blue-200',
    guest: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    suspended: 'bg-red-100 text-red-700 border-red-200'
  };

  const roleLabels = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客'
  };

  const statusLabels = {
    active: '活跃',
    inactive: '离线',
    suspended: '已停用'
  };

  const filteredUsers = users.filter(user => 
    user.name.includes(searchQuery) || 
    user.username.includes(searchQuery)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            授权管理
          </DialogTitle>
          <DialogDescription>
            管理用户权限和系统设置
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">用户管理</span>
              <span className="sm:hidden">用户</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">权限设置</span>
              <span className="sm:hidden">权限</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">统计信息</span>
              <span className="sm:hidden">统计</span>
            </TabsTrigger>
          </TabsList>

          {/* 用户管理 */}
          <TabsContent value="users" className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
            <div className="flex gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="gap-2 whitespace-nowrap">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">添加用户</span>
                <span className="sm:hidden">添加</span>
              </Button>
            </div>

            <div className="flex-1 overflow-hidden border rounded-lg">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">用户</TableHead>
                      <TableHead className="w-[15%]">角色</TableHead>
                      <TableHead className="w-[15%]">状态</TableHead>
                      <TableHead className="w-[15%]">最后活跃</TableHead>
                      <TableHead className="text-right w-[15%]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{user.name}</div>
                              <div className="text-xs text-gray-500 truncate">{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${roleColors[user.role]} whitespace-nowrap`}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusColors[user.status]} whitespace-nowrap`}>
                            {statusLabels[user.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 whitespace-nowrap">{user.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* 权限设置 */}
          <TabsContent value="permissions" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600 shrink-0" />
                    <span>管理员权限</span>
                  </h3>
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label className="block">用户管理</Label>
                        <p className="text-sm text-gray-500">添加、编辑、删除用户</p>
                      </div>
                      <Switch defaultChecked className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label className="block">系统设置</Label>
                        <p className="text-sm text-gray-500">修改系统配置</p>
                      </div>
                      <Switch defaultChecked className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label className="block">数据导出</Label>
                        <p className="text-sm text-gray-500">导出系统数据</p>
                      </div>
                      <Switch defaultChecked className="shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 shrink-0" />
                    <span>普通用户权限</span>
                  </h3>
                  <div className="space-y-3 ml-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label className="block">文件发送</Label>
                        <p className="text-sm text-gray-500">发送文件和图片</p>
                      </div>
                      <Switch defaultChecked className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label className="block">视频通话</Label>
                        <p className="text-sm text-gray-500">发起视频通话</p>
                      </div>
                      <Switch defaultChecked className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label className="block">创建群组</Label>
                        <p className="text-sm text-gray-500">创建新的群组</p>
                      </div>
                      <Switch className="shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">文件上传限制</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>最大文件大小 (MB)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <Label>允许的文件类型</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有类型</SelectItem>
                          <SelectItem value="documents">仅文档</SelectItem>
                          <SelectItem value="images">仅图片</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 统计信息 */}
          <TabsContent value="statistics" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">247</div>
                    <div className="text-sm text-gray-500 mt-1">总用户数</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">189</div>
                    <div className="text-sm text-gray-500 mt-1">在线用户</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">1,245</div>
                    <div className="text-sm text-gray-500 mt-1">今日消息</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">86</div>
                    <div className="text-sm text-gray-500 mt-1">今日文件</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">用户活跃度</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>本周活跃</span>
                        <span className="text-gray-500">76%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '76%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>本月活跃</span>
                        <span className="text-gray-500">89%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: '89%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">存储使用情况</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>已使用空间</span>
                      <span className="font-medium">45.6 GB / 100 GB</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '45.6%' }} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <div className="text-gray-500">文件</div>
                        <div className="font-medium">28.3 GB</div>
                      </div>
                      <div>
                        <div className="text-gray-500">图片</div>
                        <div className="font-medium">12.1 GB</div>
                      </div>
                      <div>
                        <div className="text-gray-500">其他</div>
                        <div className="font-medium">5.2 GB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}