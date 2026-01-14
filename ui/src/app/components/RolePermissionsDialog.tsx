import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { FolderTree } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

// 定义权限项接口
export interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

// 定义权限分类接口
export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

// 定义组件属性接口
export interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  roleName: string;
  roleId: string;
  // 可选：外部传入的权限数据，用于合并功能
  externalPermissions?: PermissionCategory[];
  // 可选：保存回调，用于将修改后的权限数据传递给父组件
  onSave?: (permissions: PermissionCategory[]) => void;
}

// 定义所有可用的权限项（简化后只保留核心功能）
const ALL_PERMISSIONS: PermissionCategory[] = [
  {
    category: '文件管理',
    permissions: [
      { id: 'file.send', name: '发送文件', description: '上传并发送文件', checked: false },
      { id: 'file.receive', name: '接收文件', description: '接收并下载文件', checked: false },
    ],
  },
  {
    category: '音视频通话',
    permissions: [
      { id: 'call.voice', name: '语音通话', description: '发起语音通话', checked: false },
      { id: 'call.video', name: '视频通话', description: '发起视频通话', checked: false },
      { id: 'call.screen', name: '屏幕共享', description: '共享屏幕内容', checked: false },
      { id: 'call.record', name: '通话录制', description: '录制通话内容', checked: false },
    ],
  },
  {
    category: '群组功能',
    permissions: [
      { id: 'group.create', name: '创建群组', description: '创建新的群组', checked: false },
      { id: 'group.manage', name: '管理群组', description: '管理群组设置和成员', checked: false },
    ],
  },
  {
    category: '用户管理',
    permissions: [
      { id: 'user.create', name: '创建用户', description: '添加新用户', checked: false },
      { id: 'user.edit', name: '编辑用户', description: '修改用户信息', checked: false },
      { id: 'user.delete', name: '删除用户', description: '删除用户账号', checked: false },
    ],
  },
];

export function RolePermissionsDialog({
  open,
  onClose,
  roleName,
  roleId,
  externalPermissions: _externalPermissions,
  onSave,
}: RolePermissionsDialogProps) {
  const [permissionData, setPermissionData] = useState<PermissionCategory[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 加载角色权限
  useEffect(() => {
    if (open && roleId) {
      loadPermissions();
    }
  }, [open, roleId]);

  const loadPermissions = async () => {
    if (!roleId) return;

    setIsLoading(true);
    try {
      const permissions = await apiService.getRolePermissions(roleId);
      const permissionIds = new Set(permissions.map(p => p.id));

      // 将权限数据映射到 ALL_PERMISSIONS 结构
      const newPermissions = ALL_PERMISSIONS.map(category => ({
        ...category,
        permissions: category.permissions.map(perm => ({
          ...perm,
          checked: permissionIds.has(perm.id)
        }))
      }));

      setPermissionData(newPermissions);
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      toast.error('加载角色权限失败');
      // 使用默认权限数据
      setPermissionData(ALL_PERMISSIONS.map(category => ({
        ...category,
        permissions: category.permissions.map(perm => ({
          ...perm,
          checked: false
        }))
      })));
    } finally {
      setIsLoading(false);
    }
  };


  // 切换权限勾选状态
  const handleTogglePermission = (categoryIndex: number, permIndex: number) => {
    // 安全检查
    if (categoryIndex < 0 || permIndex < 0) {
      console.error('无效的索引值');
      return;
    }

    try {
      setPermissionData((prev) => {
        // 创建深层副本，避免直接修改状态
        const newData = [...prev];
        
        // 检查索引是否有效
        if (categoryIndex >= newData.length) {
          console.error('分类索引超出范围');
          return prev;
        }
        
        const category = newData[categoryIndex];
        if (permIndex >= category.permissions.length) {
          console.error('权限索引超出范围');
          return prev;
        }
        
        // 创建权限数组的副本并更新指定权限
        const permissions = [...category.permissions];
        permissions[permIndex] = {
          ...permissions[permIndex],
          checked: !permissions[permIndex].checked
        };
        
        // 更新分类的权限数组
        newData[categoryIndex] = {
          ...category,
          permissions
        };
        
        return newData;
      });
    } catch (error) {
      console.error('切换权限状态失败:', error);
    }
  };

  // 保存权限配置
  const handleSave = async () => {
    if (!roleId) return;

    setIsSaving(true);
    try {
      // 获取所有选中的权限 ID
      const selectedPermissionIds = permissionData
        .flatMap(category => category.permissions)
        .filter(perm => perm.checked)
        .map(perm => perm.id);

      await apiService.updateRolePermissions(roleId, selectedPermissionIds);
      toast.success('权限配置已保存');

      // 如果提供了保存回调，调用回调并传递修改后的权限数据
      if (onSave) {
        onSave(permissionData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save role permissions:', error);
      toast.error('保存权限配置失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">
            编辑角色权限 - {roleName}
          </DialogTitle>
          <DialogDescription>
            配置该角色的功能权限（系统包含三种固定角色：系统管理员、部门主管和普通员工）
          </DialogDescription>
        </DialogHeader>

        {/* 添加溢出检查，确保内容可以滚动，并增强滑动条可见性 */}
        <ScrollArea className="flex-1 pr-0 overflow-y-auto">
          <div className="space-y-6 p-4">
            {permissionData && permissionData.length > 0 ? (
              permissionData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 sticky top-0 bg-white py-2 z-10 border-b">
                    <FolderTree className="h-4 w-4 text-purple-600" />
                    {category.category}
                  </h3>
                  <div className="ml-6 space-y-3">
                    {category.permissions.map((perm, permIndex) => (
                      <div
                        key={perm.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={perm.id}
                          checked={perm.checked}
                          onCheckedChange={() =>
                            handleTogglePermission(categoryIndex, permIndex)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={perm.id}
                            className="font-medium cursor-pointer truncate"
                          >
                            {perm.name}
                          </Label>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无权限数据
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t bg-white">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            取消
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存权限配置'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
