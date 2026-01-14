import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService, Department, User } from '../services/api';
import { Building2, User as UserIcon } from 'lucide-react';

interface DepartmentCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function DepartmentCreateDialog({
  open,
  onClose,
  onSaved,
}: DepartmentCreateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manager, setManager] = useState('');
  const [parentDept, setParentDept] = useState<string>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // 加载部门和用户���表
  useEffect(() => {
    if (open) {
      loadDepartments();
      loadUsers();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSave = async () => {
    // 验证
    if (!name.trim()) {
      toast.error('请输入部门名称');
      return;
    }

    if (!manager) {
      toast.error('请选择部门负责人');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.createDepartment({
        name: name.trim(),
        description: description.trim(),
        manager,
        parent: parentDept === 'none' ? undefined : parentDept,
      });
      toast.success('部门创建成功');
      handleClose();
      onSaved?.();
    } catch (error) {
      console.error('Failed to create department:', error);
      toast.error('创建部门失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // 重置表单
    setName('');
    setDescription('');
    setManager('');
    setParentDept('none');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            创建部门
          </DialogTitle>
          <DialogDescription>填写部门基本信息创建新部门</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name" className="text-sm font-medium">
              部门名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入部门名称，例如：技术部"
              maxLength={50}
            />
            <p className="text-xs text-gray-500">部门名称将显示在组织架构中</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-description" className="text-sm font-medium">
              部门描述
            </Label>
            <Textarea
              id="dept-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入部门描述，例如：负责产品研发和技术支持工作"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {description.length}/200 字符
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-manager" className="text-sm font-medium flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" />
              部门负责人 <span className="text-red-500">*</span>
            </Label>
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger id="dept-manager">
                <SelectValue placeholder="请选择部门负责人" />
              </SelectTrigger>
              <SelectContent>
                {users.length > 0 ? (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name} ({user.username})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="张三">张三</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">负责人将拥有部门管理权限</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-dept" className="text-sm font-medium">
              上级部门
            </Label>
            <Select value={parentDept} onValueChange={setParentDept}>
              <SelectTrigger id="parent-dept">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无（顶级部门）</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              选择上级部门可以建立组织层级关系
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              💡 <strong>提示：</strong>创建部门后，可以在部门管理中添加成员和设置权限
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? '创建中...' : '创建部门'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

