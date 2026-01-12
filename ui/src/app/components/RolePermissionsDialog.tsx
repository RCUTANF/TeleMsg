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

// 定义所有可用的权限项（从AdminCenter中合并）
const ALL_PERMISSIONS: PermissionCategory[] = [
  {
    category: '审批功能',
    permissions: [
      { id: 'approve.all', name: '审批全系统所有操作申请', description: '跨部门审批、全局操作审批、最终审批决策权', checked: false },
      { id: 'approve.dept', name: '审批本部门操作申请', description: '如设置批规则、导出本部门数据等', checked: false },
      { id: 'approve.cross', name: '发起跨部门审批申请', description: '跨部门群聊创建、数据调用等', checked: false },
      { id: 'approve.sensitive', name: '发起敏感操作申请', description: '大文件传输、跨部门聊天、本部门群聊创建等', checked: false },
      { id: 'approve.view', name: '查看个人审批申请进度', description: '查看个人申请状态', checked: false },
    ],
  },
  {
    category: '人员权限管理',
    permissions: [
      { id: 'user.manage.all', name: '添加/解冻全系统成员并赋予任意角色', description: '分配、解冻任意角色权限', checked: false },
      { id: 'user.manage.dept', name: '调整本部门工作人员权限', description: '临时为本部门成员指定工作号', checked: false },
    ],
  },
  {
    category: '数据管理',
    permissions: [
      { id: 'data.export.all', name: '查看全系统数据、导出全系统数据', description: '需自身审批宣读限', checked: false },
      { id: 'data.export.dept', name: '查看本部门数据、导出本部门数据', description: '需向系统管理员最终审批', checked: false },
      { id: 'data.clean', name: '清理违规数据', description: '删除违规内容', checked: false },
      { id: 'data.apply', name: '查看本人数据、申请导出本人/本部门数据', description: '导出申请需通过审批，记录未经批准无法执行导出操作', checked: false },
    ],
  },
  {
    category: '群聊管理',
    permissions: [
      { id: 'group.manage.all', name: '创建/管理任意群聊', description: '审批跨部门群聊创建申请', checked: false },
      { id: 'group.manage.dept', name: '创建/管理本部门群聊', description: '审批本部门小组群聊创建申请', checked: false },
      { id: 'group.cross.apply', name: '申请创建跨部门群聊', description: '需系统管理员最终审批', checked: false },
      { id: 'group.apply', name: '申请创建本部门小组群聊', description: '需部门主管审批', checked: false },
      { id: 'group.join', name: '申请加入小组群聊', description: '需双方主管审批', checked: false },
    ],
  },
  {
    category: '基础沟通',
    permissions: [
      { id: 'message.send', name: '发送消息', description: '发送文本消息', checked: false },
      { id: 'message.recall', name: '撤回消息', description: '撤回已发送的消息', checked: false },
      { id: 'message.forward', name: '转发消息', description: '转发他人消息', checked: false },
      { id: 'message.history', name: '查看历史', description: '查看聊天历史记录', checked: false },
      { id: 'file.send', name: '发送文件', description: '上传并发送文件', checked: false },
      { id: 'file.receive', name: '接收文件', description: '接收并下载文件', checked: false },
      { id: 'file.manage', name: '文件管理', description: '管理共享文件', checked: false },
      { id: 'file.export', name: '导出数据', description: '导出聊天和文件数据', checked: false },
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
      { id: 'group.join', name: '加入群组', description: '加入已有群组', checked: false },
      { id: 'group.manage', name: '管理群组', description: '管理群组设置和成员', checked: false },
      { id: 'group.dissolve', name: '解散群组', description: '解散群组', checked: false },
    ],
  },
  {
    category: '系统管理',
    permissions: [
      { id: 'system.settings', name: '系统设置', description: '修改系统配置', checked: false },
      { id: 'report.view', name: '查看报表', description: '查看统计报表', checked: false },
      { id: 'audit.view', name: '审计日志', description: '查看操作日志', checked: false },
      { id: 'role.manage', name: '角色管理', description: '管理角色权限', checked: false },
    ],
  },
  {
    category: '数据访问',
    permissions: [
      { id: 'data.access.all', name: '查看全系统信息概况', description: '访问系统级数据统计', checked: false },
      { id: 'data.access.public', name: '查看企业公开讯息', description: '访问公开信息和通知', checked: false },
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
            配置该角色的细粒度功能权限
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
