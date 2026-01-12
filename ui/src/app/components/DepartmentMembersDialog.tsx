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
import { Search, X, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar: string;
  status: 'active' | 'inactive';
}

interface DepartmentMembersDialogProps {
  open: boolean;
  onClose: () => void;
  departmentName: string;
  departmentId?: string;
}

export function DepartmentMembersDialog({
  open,
  onClose,
  departmentName,
  departmentId,
}: DepartmentMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  // 加载部门成员
  useEffect(() => {
    if (open && departmentId) {
      loadMembers();
    }
  }, [open, departmentId]);

  const loadMembers = async () => {
    if (!departmentId) return;

    setIsLoading(true);
    try {
      const data = await apiService.getDepartmentMembers(departmentId);
      setMembers(data.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role || '普通员工',
        avatar: user.avatar,
        status: user.status === 'active' ? 'active' : 'inactive'
      })));
    } catch (error) {
      console.error('Failed to load department members:', error);
      toast.error('加载部门成员失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!departmentId) return;

    try {
      await apiService.removeDepartmentMember(departmentId, memberId);
      toast.success('成员已移除');
      loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('移除成员失败');
    }
  };


  const filteredMembers = members.filter(
    (member) =>
      member.name.includes(searchQuery) ||
      member.username.includes(searchQuery) ||
      member.role.includes(searchQuery)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-xl">
                {departmentName} - 部门成员
              </DialogTitle>
              <DialogDescription>共 {members.length} 名成员</DialogDescription>
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-2">
              <UserPlus className="h-4 w-4" />
              添加成员
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索成员..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-lg">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        @{member.username}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {member.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          member.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      >
                        {member.status === 'active' ? '在线' : '离线'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  未找到匹配的成员
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
