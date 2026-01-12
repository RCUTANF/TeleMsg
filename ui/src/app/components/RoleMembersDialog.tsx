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
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  username: string;
  department: string;
  avatar: string;
  status: 'active' | 'inactive';
}

interface RoleMembersDialogProps {
  open: boolean;
  onClose: () => void;
  roleName: string;
  roleId?: string;
}

export function RoleMembersDialog({ open, onClose, roleName, roleId }: RoleMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  // 加载角色成员
  useEffect(() => {
    if (open && roleId) {
      loadMembers();
    }
  }, [open, roleId]);

  const loadMembers = async () => {
    if (!roleId) return;

    setIsLoading(true);
    try {
      const data = await apiService.getRoleMembers(roleId);
      setMembers(data.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        department: user.department || '未分配',
        avatar: user.avatar,
        status: user.status === 'active' ? 'active' : 'inactive'
      })));
    } catch (error) {
      console.error('Failed to load role members:', error);
      toast.error('加载角色成员失败');
    } finally {
      setIsLoading(false);
    }
  };


  const filteredMembers = members.filter(
    (member) =>
      member.name.includes(searchQuery) ||
      member.username.includes(searchQuery) ||
      member.department.includes(searchQuery)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {roleName} - 成员列表
          </DialogTitle>
          <DialogDescription>
            共 {members.length} 名成员
          </DialogDescription>
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
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        @{member.username} · {member.department}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
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
