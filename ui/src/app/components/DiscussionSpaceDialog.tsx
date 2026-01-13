import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Contact } from './ContactList';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { apiService, User } from '../services/api';
import { Loader2 } from 'lucide-react';

interface DiscussionSpaceDialogProps {
  open: boolean;
  onClose: () => void;
  group: Contact;
  currentUserId: string;
  onCreate: (name: string, groupId: string, members: string[], description?: string) => void;
}

export function DiscussionSpaceDialog({ 
  open, 
  onClose, 
  group, 
  currentUserId, 
  onCreate 
}: DiscussionSpaceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUserId]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载群组成员
  useEffect(() => {
    if (open && group.id) {
      loadGroupMembers();
    }
  }, [open, group.id]);

  const loadGroupMembers = async () => {
    setLoading(true);
    try {
      const members = await apiService.getGroupMembers(group.id);
      setGroupMembers(members);

      // 默认选中当前用户
      if (!selectedMembers.includes(currentUserId)) {
        setSelectedMembers([currentUserId]);
      }
    } catch (error) {
      console.error('Failed to load group members:', error);
      // 如果加载失败，使用基本的当前用户数据
      setGroupMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name, group.id, selectedMembers, description);
    onClose();
    // 重置表单
    setName('');
    setDescription('');
    setSelectedMembers([currentUserId]);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建讨论空间</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">空间名称</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="请输入讨论空间名称" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">空间描述 (可选)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="请输入讨论空间描述" 
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>选择成员</Label>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">加载群组成员...</span>
              </div>
            ) : groupMembers.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {groupMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{member.name}</div>
                      {member.username && (
                        <div className="text-xs text-gray-500">@{member.username}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 text-sm">
                无法加载群组成员
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || selectedMembers.length === 0}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}