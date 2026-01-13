import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  User, 
  Bell, 
  Lock, 
  Globe,
  Camera,
  Save
} from 'lucide-react';
import { Separator } from './ui/separator';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  onUpdateProfile?: (name: string, username: string) => void;
  onUpdateProxySettings?: (settings: {
    enabled: boolean;
    host: string;
    port: string;
    type: string;
  }) => void;
}

export function SettingsDialog({ open, onClose, currentUser, onUpdateProfile, onUpdateProxySettings }: SettingsDialogProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');

  // 初始化代理设置
  const [proxyEnabled, setProxyEnabled] = useState(() => {
    const saved = localStorage.getItem('proxySettings');
    return saved ? JSON.parse(saved).enabled : false;
  });
  const [proxyHost, setProxyHost] = useState(() => {
    const saved = localStorage.getItem('proxySettings');
    return saved ? JSON.parse(saved).host : '';
  });
  const [proxyPort, setProxyPort] = useState(() => {
    const saved = localStorage.getItem('proxySettings');
    return saved ? JSON.parse(saved).port : '';
  });
  const [proxyType, setProxyType] = useState(() => {
    const saved = localStorage.getItem('proxySettings');
    return saved ? JSON.parse(saved).type : 'http';
  });

  const handleSaveProfile = () => {
    onUpdateProfile?.(name, username);
  };

  const handleSaveProxySettings = () => {
    onUpdateProxySettings?.({
      enabled: proxyEnabled,
      host: proxyHost,
      port: proxyPort,
      type: proxyType
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl min-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">设置</DialogTitle>
          <DialogDescription>
            管理您的个人资料和应用偏好设置
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="profile" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-white border-b h-12">
            <TabsTrigger value="profile" className="gap-2 flex items-center justify-center h-full data-[state=active]:bg-gray-100 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:rounded-md">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">个人</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 flex items-center justify-center h-full data-[state=active]:bg-gray-100 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:rounded-md">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">通知</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2 flex items-center justify-center h-full data-[state=active]:bg-gray-100 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:rounded-md">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">高级</span>
            </TabsTrigger>
          </TabsList>
          {/* 个人资料 */}
          <TabsContent value="profile" className="space-y-6 overflow-y-auto flex-1">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">姓名</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-username">账号</Label>
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                更改密码
              </Button>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              保存更改
            </Button>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-6 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用通知</Label>
                  <p className="text-sm text-gray-500">接收新消息通知</p>
                </div>
                <Switch
                  checked={enableNotifications}
                  onCheckedChange={setEnableNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>声音提醒</Label>
                  <p className="text-sm text-gray-500">消息到达时播放提示音</p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  disabled={!enableNotifications}
                />
              </div>
            </div>
          </TabsContent>



          {/* 高级设置 */}
          <TabsContent value="advanced" className="space-y-6 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用代理</Label>
                  <p className="text-sm text-gray-500">通过代理服务器连接</p>
                </div>
                <Switch
                  checked={proxyEnabled}
                  onCheckedChange={setProxyEnabled}
                />
              </div>

              {proxyEnabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="proxy-host">代理服务器地址</Label>
                      <Input
                        id="proxy-host"
                        placeholder="127.0.0.1"
                        value={proxyHost}
                        onChange={(e) => setProxyHost(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proxy-port">端口</Label>
                      <Input
                        id="proxy-port"
                        placeholder="8080"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>代理类型</Label>
                      <Select value={proxyType} onValueChange={setProxyType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="socks5">SOCKS5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSaveProxySettings} className="w-full mt-4">
                      <Save className="h-4 w-4 mr-2" />
                      保存代理设置
                    </Button>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>数据存储</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    清除缓存
                  </Button>
                  <Button variant="outline" className="flex-1">
                    导出数据
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动更新</Label>
                  <p className="text-sm text-gray-500">自动下载并安装更新</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}