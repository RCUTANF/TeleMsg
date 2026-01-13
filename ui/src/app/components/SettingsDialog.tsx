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
  Save,
  X,
  CheckCircle2
} from 'lucide-react';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

// Security policy type
interface SecurityPolicy {
  password: {
    minLength: string;
    requireLetters: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  login: {
    allowMultiDevice: boolean;
    maxDevices: string;
    ipRestriction: boolean;
    sessionTimeout: number;
  };
  content: {
    enableSensitiveWordFilter: boolean;
    enableFileScan: boolean;
    enableImageRecognition: boolean;
  };
  data: {
    enableEndToEndEncryption: boolean;
    enableAutoBackup: boolean;
    retentionDays: string;
  };
}

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
  onChangePassword?: (oldPassword: string, newPassword: string) => void;
  securityPolicy?: SecurityPolicy;
}

export function SettingsDialog({ open, onClose, currentUser, onUpdateProfile, onChangePassword, securityPolicy, onUpdateProxySettings }: SettingsDialogProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Default security policy if not provided
  const defaultSecurityPolicy: SecurityPolicy = {
    password: {
      minLength: '8',
      requireLetters: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
    login: {
      allowMultiDevice: true,
      maxDevices: '3',
      ipRestriction: false,
      sessionTimeout: 30,
    },
    content: {
      enableSensitiveWordFilter: true,
      enableFileScan: true,
      enableImageRecognition: false,
    },
    data: {
      enableEndToEndEncryption: true,
      enableAutoBackup: true,
      retentionDays: '365',
    },
  };

  // Use provided security policy or default
  const currentPolicy = securityPolicy || defaultSecurityPolicy;

  const handleSaveProfile = () => {
    onUpdateProfile?.(name, username);
  };

  // Password validation according to security policy
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    const minLength = parseInt(currentPolicy.password.minLength);

    // Minimum length requirement
    if (password.length < minLength) {
      errors.push(`密码长度至少为${minLength}个字符`);
    }

    // Must contain letters
    if (currentPolicy.password.requireLetters && !/[a-zA-Z]/.test(password)) {
      errors.push('密码必须包含字母');
    }

    // Must contain numbers
    if (currentPolicy.password.requireNumbers && !/\d/.test(password)) {
      errors.push('密码必须包含数字');
    }

    // Must contain special characters
    if (currentPolicy.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密码必须包含特殊字符');
    }

    return errors;
  };

  const handlePasswordChange = () => {
    // Reset errors
    setPasswordErrors([]);

    // Validate old password
    if (!oldPassword) {
      setPasswordErrors(['请输入当前密码']);
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
      return;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setPasswordErrors(['两次输入的新密码不一致']);
      return;
    }

    // Call password change handler
    onChangePassword?.(oldPassword, newPassword);

    // Reset form and close dialog
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordDialogOpen(false);
    toast.success('密码已成功更改');
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
      <>
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
                  <Button variant="outline" className="w-full" onClick={() => setPasswordDialogOpen(true)}>
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

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">更改密码</DialogTitle>
              <DialogDescription>
                请按照安全策略要求设置新密码
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="old-password">当前密码</Label>
                <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入当前密码"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.length > 0) {
                        setPasswordErrors([]);
                      }
                    }}
                    placeholder="请输入新密码"
                />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.length > 0) {
                        setPasswordErrors([]);
                      }
                    }}
                    placeholder="请再次输入新密码"
                />
              </div>

              {/* Password Requirements */}
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-700">密码要求：</p>
                <div className="flex items-center gap-2 text-gray-600">
                  {newPassword.length >= parseInt(currentPolicy.password.minLength) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                      <div className="h-4 w-4 text-gray-400">•</div>
                  )}
                  <span>至少{currentPolicy.password.minLength}个字符</span>
                </div>
                {currentPolicy.password.requireLetters && (
                    <div className="flex items-center gap-2 text-gray-600">
                      {/[a-zA-Z]/.test(newPassword) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                          <div className="h-4 w-4 text-gray-400">•</div>
                      )}
                      <span>包含字母</span>
                    </div>
                )}
                {currentPolicy.password.requireNumbers && (
                    <div className="flex items-center gap-2 text-gray-600">
                      {/\d/.test(newPassword) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                          <div className="h-4 w-4 text-gray-400">•</div>
                      )}
                      <span>包含数字</span>
                    </div>
                )}
                {currentPolicy.password.requireSpecialChars && (
                    <div className="flex items-center gap-2 text-gray-600">
                      {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                          <div className="h-4 w-4 text-gray-400">•</div>
                      )}
                      <span>包含特殊字符</span>
                    </div>
                )}
              </div>

              {/* Error Messages */}
              {passwordErrors.length > 0 && (
                  <div className="space-y-1">
                    {passwordErrors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                          <X className="h-4 w-4" />
                          <span>{error}</span>
                        </div>
                    ))}
                  </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setPasswordDialogOpen(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordErrors([]);
                    }}
                >
                  取消
                </Button>
                <Button
                    className="flex-1"
                    onClick={handlePasswordChange}
                >
                  确认更改
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
  );
}