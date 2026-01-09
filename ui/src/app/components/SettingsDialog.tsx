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
  Palette, 
  Globe, 
  Shield,
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
}

export function SettingsDialog({ open, onClose, currentUser, onUpdateProfile }: SettingsDialogProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');

  const handleSaveProfile = () => {
    onUpdateProfile?.(name, username);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">设置</DialogTitle>
          <DialogDescription>
            管理您的个人资料和应用偏好设置
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">个人</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">通知</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">隐私</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">高级</span>
            </TabsTrigger>
          </TabsList>

          {/* 个人资料 */}
          <TabsContent value="profile" className="space-y-6">
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

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              保存更改
            </Button>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-6">
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

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>桌面通知</Label>
                  <p className="text-sm text-gray-500">在桌面显示消息通知</p>
                </div>
                <Switch
                  checked={desktopNotifications}
                  onCheckedChange={setDesktopNotifications}
                  disabled={!enableNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>消息预览</Label>
                <Select defaultValue="full">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">显示发送者和内容</SelectItem>
                    <SelectItem value="sender">仅显示发送者</SelectItem>
                    <SelectItem value="none">不显示预览</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>主题</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="auto">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>语言</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="zh-TW">繁體中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>字体大小</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">小</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* 隐私与安全 */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>最后上线时间</Label>
                  <p className="text-sm text-gray-500">允许他人看到你的最后上线时间</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>已读回执</Label>
                  <p className="text-sm text-gray-500">发送消息已读状态</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>谁可以联系我</Label>
                <Select defaultValue="everyone">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">所有人</SelectItem>
                    <SelectItem value="contacts">仅联系人</SelectItem>
                    <SelectItem value="nobody">无人</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  更改密码
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 高级设置 */}
          <TabsContent value="advanced" className="space-y-6">
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
                      <Select defaultValue="http">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="socks5">SOCKS5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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