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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

interface DepartmentEditDialogProps {
  open: boolean;
  onClose: () => void;
  departmentId?: string;
  departmentName: string;
  departmentManager: string;
  departmentParent?: string;
  onSaved?: () => void;
}

export function DepartmentEditDialog({
  open,
  onClose,
  departmentId,
  departmentName,
  departmentManager,
  departmentParent,
  onSaved,
}: DepartmentEditDialogProps) {
  const [name, setName] = useState(departmentName);
  const [manager, setManager] = useState(departmentManager);
  const [parentDept, setParentDept] = useState(departmentParent || 'none');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(departmentName);
    setManager(departmentManager);
    setParentDept(departmentParent || 'none');
  }, [departmentName, departmentManager, departmentParent]);

  const handleSave = async () => {
    if (!departmentId) return;

    setIsSaving(true);
    try {
      await apiService.updateDepartment(departmentId, {
        name,
        manager,
        parent: parentDept === 'none' ? undefined : parentDept,
      });
      toast.success('部门信息已更新');
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Failed to update department:', error);
      toast.error('更新部门信息失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">编辑部门信息</DialogTitle>
          <DialogDescription>修改部门的基本信息</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">部门名称</Label>
            <Input
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入部门名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-manager">部门负责人</Label>
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger id="dept-manager">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="张三">张三</SelectItem>
                <SelectItem value="李四">李四</SelectItem>
                <SelectItem value="王五">王五</SelectItem>
                <SelectItem value="赵六">赵六</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-dept">上级部门</Label>
            <Select value={parentDept} onValueChange={setParentDept}>
              <SelectTrigger id="parent-dept">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无（顶级部门）</SelectItem>
                <SelectItem value="1">技术部</SelectItem>
                <SelectItem value="3">人力资源部</SelectItem>
                <SelectItem value="4">财务部</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-desc">部门描述</Label>
            <Input
              id="dept-desc"
              placeholder="请输入部门描述（可选）"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存修改'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
