import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { apiService, User, Role, Department } from '../services/api';
import { toast } from 'sonner';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import {
  Shield, 
  Users, 
  UserPlus, 
  Trash2, 
  Edit,
  Search,
  BarChart3,
  ArrowLeft,
  Building2,
  Lock,
  FileCheck,
  History,
  Settings,
  UserCog,
  FolderTree,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Plus
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { RoleMembersDialog } from './RoleMembersDialog';
import { RolePermissionsDialog } from './RolePermissionsDialog';
import { DepartmentMembersDialog } from './DepartmentMembersDialog';
import { DepartmentEditDialog } from './DepartmentEditDialog';

interface AdminCenterProps {
  onClose: () => void;
}

export function AdminCenter({ onClose }: AdminCenterProps) {
  const [activeMenu, setActiveMenu] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [_isLoading, setIsLoading] = useState(false);

  // 对话框状态管理
  const [roleMembersOpen, setRoleMembersOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissionsOpen, setRolePermissionsOpen] = useState(false);
  const [deptMembersOpen, setDeptMembersOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptEditOpen, setDeptEditOpen] = useState(false);

  // 数据状态
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [_stats, setStats] = useState<{
    totalUsers: number;
    onlineUsers: number;
    totalMessages: number;
    storageUsed: number;
    totalDepartments?: number;
    totalRoles?: number;
  }>({
    totalUsers: 0,
    onlineUsers: 0,
    totalMessages: 0,
    storageUsed: 0,
    totalDepartments: 0,
    totalRoles: 0
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData, departmentsData, statsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getRoles(),
        apiService.getDepartments(),
        apiService.getSystemStats()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setDepartments(departmentsData);
      setStats({
        ...statsData,
        totalDepartments: statsData.totalDepartments ?? 0,
        totalRoles: statsData.totalRoles ?? 0
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };


  // 权限项定义
  const permissionCategories = {
    '消息通讯': [
      { id: 'message.send', name: '发送消息', description: '发送文本消息' },
      { id: 'message.recall', name: '撤回消息', description: '撤回已发送的消息' },
      { id: 'message.forward', name: '转发消息', description: '转发他人消息' },
      { id: 'message.history', name: '查看历史', description: '查看聊天历史记录' },
    ],
    '文件管理': [
      { id: 'file.send', name: '发送文件', description: '上传并发送文件' },
      { id: 'file.receive', name: '接收文件', description: '接收并下载文件' },
      { id: 'file.manage', name: '文件管理', description: '管理共享文件' },
      { id: 'file.export', name: '导出数据', description: '导出聊天和文件数据' },
    ],
    '音视频通话': [
      { id: 'call.voice', name: '语音通话', description: '发起语音通话' },
      { id: 'call.video', name: '视频通话', description: '发起视频通话' },
      { id: 'call.screen', name: '屏幕共享', description: '共享屏幕内容' },
      { id: 'call.record', name: '通话录制', description: '录制通话内容' },
    ],
    '群组功能': [
      { id: 'group.create', name: '创建群组', description: '创建新的群组' },
      { id: 'group.join', name: '加入群组', description: '加入已有群组' },
      { id: 'group.manage', name: '管理群组', description: '管理群组设置和成员' },
      { id: 'group.dissolve', name: '解散群组', description: '解散群组' },
    ],
    '用户管理': [
      { id: 'user.view', name: '查看用户', description: '查看用户信息' },
      { id: 'user.create', name: '创建用户', description: '添加新用户' },
      { id: 'user.edit', name: '编辑用户', description: '修改用户信息' },
      { id: 'user.delete', name: '删除用户', description: '删除用户账号' },
    ],
    '系统管理': [
      { id: 'system.settings', name: '系统设置', description: '修改系统配置' },
      { id: 'report.view', name: '查看报表', description: '查看统计报表' },
      { id: 'audit.view', name: '审计日志', description: '查看操作日志' },
      { id: 'role.manage', name: '角色管理', description: '管理角色权限' },
    ],
  };

  // 待审批项
  const [pendingApprovals] = useState([
    { id: '1', type: '用户注册', user: '新用户001', department: '技术部', time: '5分钟前', status: 'pending' },
    { id: '2', type: '文件分享', user: '李四', department: '市场部', time: '1小时前', status: 'pending' },
    { id: '3', type: '权限申请', user: '王五', department: '技术部', time: '2小时前', status: 'pending' },
  ]);

  // 审计日志
  const [auditLogs] = useState([
    { id: '1', user: '张三', action: '修改用户权限', target: '李四', time: '2026-01-11 14:30:00', result: 'success' },
    { id: '2', user: '李四', action: '创建群组', target: '产品讨论组', time: '2026-01-11 13:15:00', result: 'success' },
    { id: '3', user: '王五', action: '导出数据', target: '聊天记录', time: '2026-01-11 11:20:00', result: 'failed' },
    { id: '4', user: '张三', action: '删除用户', target: '赵六', time: '2026-01-11 10:00:00', result: 'success' },
  ]);

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    suspended: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusLabels = {
    active: '正常',
    inactive: '离线',
    suspended: '已停用'
  };

  const filteredUsers = users.filter(user => 
    user.name.includes(searchQuery) || 
    user.username.includes(searchQuery) ||
    (user.department?.includes(searchQuery) ?? false)
  );

  const menuItems = [
    { id: 'users', icon: Users, label: '用户管理', count: users.length },
    { id: 'roles', icon: UserCog, label: '角色权限', count: roles.length },
    { id: 'departments', icon: Building2, label: '组织架构', count: departments.length },
    { id: 'approvals', icon: FileCheck, label: '审批管理', count: pendingApprovals.length },
    { id: 'security', icon: Lock, label: '安全策略' },
    { id: 'audit', icon: History, label: '审计日志' },
    { id: 'statistics', icon: BarChart3, label: '统计分析' },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between px-6 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">管理中心</h1>
              <p className="text-xs text-purple-100">Administration Center</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">系统管理员</div>
            <div className="text-xs text-purple-100">张三</div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧菜单 */}
        <aside className="w-64 bg-gray-50 border-r flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <Badge variant={activeMenu === item.id ? 'default' : 'secondary'} className={activeMenu === item.id ? 'bg-purple-600' : ''}>
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* 右侧内容区 */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-8">
              {/* 用户管理 */}
              {activeMenu === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
                      <p className="text-gray-500 mt-1">管理系统中的所有用户账号</p>
                    </div>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <UserPlus className="h-4 w-4" />
                      添加用户
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="搜索用户名、账号或部门..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="active">正常</SelectItem>
                            <SelectItem value="inactive">离线</SelectItem>
                            <SelectItem value="suspended">已停用</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="all-dept">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-dept">全部部门</SelectItem>
                            <SelectItem value="tech">技术部</SelectItem>
                            <SelectItem value="market">市场部</SelectItem>
                            <SelectItem value="hr">人力资源部</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[30%]">用户信息</TableHead>
                            <TableHead>角色</TableHead>
                            <TableHead>部门</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>最后活跃</TableHead>
                            <TableHead>加入时间</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {user.role || '未分配'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600">{user.department || '未分配'}</TableCell>
                              <TableCell>
                                {user.status && (
                                  <Badge variant="outline" className={statusColors[user.status]}>
                                    {statusLabels[user.status]}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-500 text-sm">{user.lastActive || '-'}</TableCell>
                              <TableCell className="text-gray-500 text-sm">{user.createdAt || '-'}</TableCell>
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
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 角色权限 */}
              {activeMenu === 'roles' && (
                <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">角色权限</h2>
                      <p className="text-gray-500 mt-1">定义角色并分配相应的权限</p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4" />
                        创建角色
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                      <Card key={role.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-5 w-5 text-purple-600" />
                                {role.name}
                              </CardTitle>
                              <CardDescription className="mt-2">{role.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">{role.userCount} 人</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-2">已分配权限</div>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions.slice(0, 5).map((perm) => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                              {role.permissions.length > 5 && (
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  +{role.permissions.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                              setSelectedRole(role);
                              setRolePermissionsOpen(true);
                            }}>
                              <Edit className="h-3 w-3 mr-1" />
                              编辑权限
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                              setSelectedRole(role);
                              setRoleMembersOpen(true);
                            }}>
                              <Users className="h-3 w-3 mr-1" />
                              查看成员
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 合并的权限矩阵功能 */}
                  <Card className="sticky top-0 z-10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>权限矩阵</CardTitle>
                          <CardDescription>为不同角色配置具体的功能权限</CardDescription>
                        </div>
                        <Select defaultValue="2">
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[70vh] border rounded-lg overflow-x-auto overflow-y-auto">
                        <div className="p-4 min-w-full">
                          <div className="space-y-6 pb-4">
                            {Object.entries(permissionCategories).map(([category, permissions]) => (
                              <div key={category} className="space-y-3">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <FolderTree className="h-4 w-4 text-purple-600" />
                                  {category}
                                </h3>
                                <div className="ml-6 space-y-3">
                                  {permissions.map((perm) => (
                                    <div key={perm.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                      <div className="flex items-center gap-3 flex-1">
                                        <Checkbox id={perm.id} defaultChecked={Math.random() > 0.3} />
                                        <div>
                                          <Label htmlFor={perm.id} className="font-medium cursor-pointer">
                                            {perm.name}
                                          </Label>
                                          <p className="text-xs text-gray-500">{perm.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline">取消</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700">保存权限配置</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 组织架构 */}
              {activeMenu === 'departments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">组织架构</h2>
                      <p className="text-gray-500 mt-1">管理企业的部门和团队结构</p>
                    </div>
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" />
                      创建部门
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                      <Card key={dept.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-600" />
                            {dept.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">部门负责人</span>
                              <span className="font-medium">{dept.manager}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">成员数量</span>
                              <Badge variant="secondary">{dept.memberCount}</Badge>
                            </div>
                            {dept.parent && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">上级部门</span>
                                <span className="text-xs text-purple-600">技术部</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                              setSelectedDept(dept);
                              setDeptEditOpen(true);
                            }}>
                              <Edit className="h-3 w-3 mr-1" />
                              编辑
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                              setSelectedDept(dept);
                              setDeptMembersOpen(true);
                            }}>
                              <Users className="h-3 w-3 mr-1" />
                              成员
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}



              {/* 审批管理 */}
              {activeMenu === 'approvals' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">审批管理</h2>
                    <p className="text-gray-500 mt-1">处理用户申请和敏感操作审批</p>
                  </div>

                  <Tabs defaultValue="pending">
                    <TabsList>
                      <TabsTrigger value="pending" className="gap-2">
                        待审批
                        <Badge variant="secondary">{pendingApprovals.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="approved">已通过</TabsTrigger>
                      <TabsTrigger value="rejected">已拒绝</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending" className="space-y-4 mt-6">
                      {pendingApprovals.map((approval) => (
                        <Card key={approval.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                  <AlertCircle className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-gray-900">{approval.type}</h4>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                      待审批
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span>申请人：{approval.user}</span>
                                    <span>•</span>
                                    <span>部门：{approval.department}</span>
                                    <span>•</span>
                                    <span>{approval.time}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" className="gap-2">
                                  <XCircle className="h-4 w-4" />
                                  拒绝
                                </Button>
                                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  通过
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* 安全策略 */}
              {activeMenu === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">安全策略</h2>
                    <p className="text-gray-500 mt-1">配置系统安全和访问控制策略</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-purple-600" />
                          密码策略
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>最小密码长度</Label>
                          <Select defaultValue="8">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">6位</SelectItem>
                              <SelectItem value="8">8位</SelectItem>
                              <SelectItem value="12">12位</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>必须包含数字</Label>
                            <p className="text-xs text-gray-500">密码中必须包含数字字符</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>必须包含特殊字符</Label>
                            <p className="text-xs text-gray-500">密码中必须包含特殊符号</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>密码有效期（天）</Label>
                          <Input type="number" defaultValue="90" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-600" />
                          登录策略
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>允许多设备登录</Label>
                            <p className="text-xs text-gray-500">同一账号可在多个设备登录</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>最大同时登录设备数</Label>
                          <Select defaultValue="3">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1台</SelectItem>
                              <SelectItem value="3">3台</SelectItem>
                              <SelectItem value="5">5台</SelectItem>
                              <SelectItem value="unlimited">不限制</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP地址限制</Label>
                            <p className="text-xs text-gray-500">限制特定IP地址访问</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>会话超时（分钟）</Label>
                          <Input type="number" defaultValue="30" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-purple-600" />
                          内容审核
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>启用敏感词过滤</Label>
                            <p className="text-xs text-gray-500">自动过滤敏感词汇</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>文件扫描</Label>
                            <p className="text-xs text-gray-500">扫描上传文件的安全性</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>图片内容识别</Label>
                            <p className="text-xs text-gray-500">识别图片中的敏感内容</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-purple-600" />
                          数据安全
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>启用端到端加密</Label>
                            <p className="text-xs text-gray-500">消息端到端加密传输</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>自动备份</Label>
                            <p className="text-xs text-gray-500">定期自动备份数据</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>数据保留期（天）</Label>
                          <Select defaultValue="365">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30天</SelectItem>
                              <SelectItem value="90">90天</SelectItem>
                              <SelectItem value="365">365天</SelectItem>
                              <SelectItem value="forever">永久保留</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700">保存安全策略</Button>
                  </div>
                </div>
              )}

              {/* 审计日志 */}
              {activeMenu === 'audit' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">审计日志</h2>
                      <p className="text-gray-500 mt-1">查看系统操作记录和安全事件</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      导出日志
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex gap-3">
                        <Input placeholder="搜索日志..." className="flex-1" />
                        <Select defaultValue="all">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部操作</SelectItem>
                            <SelectItem value="user">用户管理</SelectItem>
                            <SelectItem value="permission">权限变更</SelectItem>
                            <SelectItem value="data">数据操作</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="today">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">今天</SelectItem>
                            <SelectItem value="week">最近7天</SelectItem>
                            <SelectItem value="month">最近30天</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>操作人</TableHead>
                            <TableHead>操作类型</TableHead>
                            <TableHead>操作对象</TableHead>
                            <TableHead>操作时间</TableHead>
                            <TableHead>结果</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{log.user}</TableCell>
                              <TableCell>{log.action}</TableCell>
                              <TableCell className="text-gray-600">{log.target}</TableCell>
                              <TableCell className="text-gray-500 text-sm">{log.time}</TableCell>
                              <TableCell>
                                {log.result === 'success' ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    成功
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    失败
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 统计分析 */}
              {activeMenu === 'statistics' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">统计分析</h2>
                    <p className="text-gray-500 mt-1">查看系统使用情况和数据统计</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">总用户数</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">247</p>
                            <p className="text-xs text-green-600 mt-1">↑ 12% 较上月</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">在线用户</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">189</p>
                            <p className="text-xs text-gray-500 mt-1">76.5% 在线率</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">今日消息</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">1.2K</p>
                            <p className="text-xs text-green-600 mt-1">↑ 8% 较昨日</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">存储使用</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">45.6GB</p>
                            <p className="text-xs text-gray-500 mt-1">/ 100GB</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Upload className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>用户活跃度</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>今日活跃</span>
                            <span className="font-medium text-gray-900">189 / 247</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: '76.5%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>本周活跃</span>
                            <span className="font-medium text-gray-900">232 / 247</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full" style={{ width: '94%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>本月活跃</span>
                            <span className="font-medium text-gray-900">245 / 247</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" style={{ width: '99.2%' }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>部门人员分布</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {departments.map((dept) => (
                          <div key={dept.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              <span className="text-sm">{dept.name}</span>
                            </div>
                            <Badge variant="secondary">{dept.memberCount}人</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* 对话框 */}
      {selectedRole && (
        <>
          <RoleMembersDialog
            open={roleMembersOpen}
            onClose={() => setRoleMembersOpen(false)}
            roleName={selectedRole.name}
            roleId={selectedRole.id}
          />
          <RolePermissionsDialog
            open={rolePermissionsOpen}
            onClose={() => setRolePermissionsOpen(false)}
            roleName={selectedRole.name}
            roleId={selectedRole.id}
            onSave={(permissions) => {
              // 可选：处理保存后的权限数据
              console.log('Permissions saved:', permissions);
              loadData(); // 重新加载数据
            }}
          />
        </>
      )}
      
      {selectedDept && (
        <>
          <DepartmentMembersDialog
            open={deptMembersOpen}
            onClose={() => setDeptMembersOpen(false)}
            departmentName={selectedDept.name}
            departmentId={selectedDept.id}
          />
          <DepartmentEditDialog
            open={deptEditOpen}
            onClose={() => setDeptEditOpen(false)}
            departmentId={selectedDept.id}
            departmentName={selectedDept.name}
            departmentManager={selectedDept.manager}
            departmentParent={selectedDept.parent}
            onSaved={() => loadData()}
          />
        </>
      )}
    </div>
  );
}

