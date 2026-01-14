import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, UserPlus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService, User } from '../services/api';
import { toast } from 'sonner';

interface AddDepartmentMemberDialogProps {
    open: boolean;
    onClose: () => void;
    departmentName: string;
    departmentId?: string;
    existingMemberIds?: string[];
    onMemberAdded?: () => void;
}

export function AddDepartmentMemberDialog({
                                              open,
                                              onClose,
                                              departmentName,
                                              departmentId,
                                              existingMemberIds = [],
                                              onMemberAdded,
                                          }: AddDepartmentMemberDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // 加载所有用户
    useEffect(() => {
        if (open) {
            loadUsers();
            setSelectedUserIds(new Set());
        }
    }, [open]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getAllUsers();
            setAllUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('加载用户列表失败');
        } finally {
            setIsLoading(false);
        }
    };

    // 过滤出不在当前部门的用户
    const availableUsers = allUsers.filter(
        (user) => !existingMemberIds.includes(user.id)
    );

    const filteredUsers = availableUsers.filter(
        (user) =>
            user.name.includes(searchQuery) ||
            user.username.includes(searchQuery) ||
            (user.department?.includes(searchQuery) ?? false)
    );

    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUserIds);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUserIds(newSelection);
    };

    const handleAddMembers = async () => {
        if (!departmentId || selectedUserIds.size === 0) {
            toast.error('请至少选择一个成员');
            return;
        }

        setIsAdding(true);
        try {
            await apiService.addDepartmentMembers(
                departmentId,
                Array.from(selectedUserIds)
            );
            toast.success(`已成功添加 ${selectedUserIds.size} 名成员`);
            onMemberAdded?.();
            handleClose();
        } catch (error) {
            console.error('Failed to add members:', error);
            toast.error('添加成员失败');
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedUserIds(new Set());
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl h-[85vh] max-h-[700px] flex flex-col p-0">
                <div className="p-6 pb-4 flex-shrink-0 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-xl">添加成员到 {departmentName}</DialogTitle>
                        <DialogDescription>
                            选择要添加到部门的成员 {selectedUserIds.size > 0 && `（已选择 ${selectedUserIds.size} 人）`}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 flex flex-col min-h-0 px-6">
                    {/* 搜索框 */}
                    <div className="relative flex-shrink-0 py-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="搜索用户名、账号或部门..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* 用户列表 - 使用固定高度的可滚动区域 */}
                    <div className="flex-1 min-h-0 pb-4">
                        <ScrollArea className="h-full">
                            <div className="space-y-2 pr-4">
                                {isLoading ? (
                                    <div className="text-center py-8 text-gray-500">加载中...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchQuery ? '未找到匹配的用户' : '暂无可添加的用户'}
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const isSelected = selectedUserIds.has(user.id);
                                        return (
                                            <div
                                                key={user.id}
                                                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? 'bg-purple-50 border-purple-300'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => toggleUserSelection(user.id)}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <Avatar className="h-12 w-12 flex-shrink-0">
                                                        <AvatarImage src={user.avatar} alt={user.name} />
                                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-lg">{user.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        {user.department && (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                                            >
                                                                {user.department}
                                                            </Badge>
                                                        )}
                                                        {user.role && (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-gray-50 text-gray-700 border-gray-200"
                                                            >
                                                                {user.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-3 flex-shrink-0">
                                                    {isSelected ? (
                                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                                            <Check className="h-4 w-4 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* 底部按钮区域 - 固定在底部 */}
                <div className="flex-shrink-0 p-6 pt-4 border-t bg-white">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            {availableUsers.length > 0
                                ? `共 ${availableUsers.length} 个可添加用户`
                                : '所有用户都已在此部门中'}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleClose} disabled={isAdding}>
                                取消
                            </Button>
                            <Button
                                onClick={handleAddMembers}
                                disabled={isAdding || selectedUserIds.size === 0}
                                className="bg-purple-600 hover:bg-purple-700 gap-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                {isAdding
                                    ? '添加中...'
                                    : `添加 ${selectedUserIds.size > 0 ? `(${selectedUserIds.size})` : ''}`}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
