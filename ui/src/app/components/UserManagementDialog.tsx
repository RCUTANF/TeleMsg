import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiService, User, Department } from '../services/api';
import { toast } from 'sonner';

interface UserManagementDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  departments: Department[];
  onSaved: () => void;
}

export function UserManagementDialog({ open, onClose, user, departments, onSaved }: UserManagementDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    departmentId: '',
  });
  const [loading, setLoading] = useState(false);

  // 确保 departments 是一个数组
  const safeDepartments = Array.isArray(departments) ? departments : [];

  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          username: user.username || '',
          password: '',
          name: user.name || '',
          email: '',
          phone: '',
          role: user.role?.toLowerCase() || 'employee',
          departmentId: user.department || '',
        });
      } else {
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          phone: '',
          role: 'employee',
          departmentId: '',
        });
      }
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && !formData.password) {
      toast.error('请输入密码');
      return;
    }

    if (!formData.username || !formData.name) {
      toast.error('请填写用户名和姓名');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // 更新用户
        await apiService.updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isAdmin: formData.role === 'director',
        });

        // 如果部门改变，更新部门
        const newDeptId = formData.departmentId === '__none__' ? '' : formData.departmentId;
        if (newDeptId && newDeptId !== user.department) {
          await apiService.updateUserDepartment(user.id, newDeptId);
        }

        toast.success('用户更新成功');
      } else {
        // 创建用户
        const deptId = formData.departmentId === '__none__' ? undefined : formData.departmentId;
        await apiService.createUser({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          departmentId: deptId,
        });
        toast.success('用户创建成功');
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('保存用户失败:', error);
      toast.error(error.message || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? '编辑用户' : '添加用户'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名 *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!!user}
              placeholder="请输入用户名"
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="请输入密码"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="请输入邮箱"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">角色</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">普通员工</SelectItem>
                <SelectItem value="manager">部门主管</SelectItem>
                <SelectItem value="director">系统管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">部门</Label>
            <Select
              value={formData.departmentId || undefined}
              onValueChange={(value) => setFormData({ ...formData, departmentId: value || '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">未分配</SelectItem>
                {safeDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

