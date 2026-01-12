import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MessageSquare, Lock, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { apiService } from '../services/api';

interface LoginPageProps {
  onLogin: (user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isAdmin: boolean
  }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 清除消息
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 前端验证
    if (!loginUsername.trim()) {
      setError('请输入账号');
      return;
    }
    if (!loginPassword) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);

    try {
      // 调用真实的API登录接口
      const response = await apiService.login(loginUsername, loginPassword);

      // 保存token
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      // 调用父组件的onLogin回调
      onLogin({
        id: response.user.id,
        name: response.user.name || response.user.username,
        username: response.user.username,
        avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.username}`,
        isAdmin:response.user.isAdmin??false
      });

      setSuccessMessage('登录成功！');

    } catch (error: any) {
      console.error('登录失败:', error);

      // 处理不同的错误情况
      if (error.message.includes('401')) {
        setError('用户名或密码错误');
      } else if (error.message.includes('403')) {
        setError('账号已被禁用，请联系管理员');
      } else if (error.message.includes('404')) {
        setError('用户不存在');
      } else if (error.message.includes('network')) {
        setError('网络连接失败，请检查网络');
      } else {
        setError('登录失败，请稍后再试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 前端验证
    if (!registerName.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!registerUsername.trim()) {
      setError('请输入账号');
      return;
    }
    if (registerUsername.length < 3) {
      setError('账号长度至少3个字符');
      return;
    }
    if (!registerPassword) {
      setError('请输入密码');
      return;
    }
    if (registerPassword.length < 6) {
      setError('密码长度至少6个字符');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      // 调用真实的API注册接口
      const response = await apiService.register(
          registerName,
          registerUsername,
          registerPassword
      );

      // 注册成功后自动登录
      if (response.token) {
        localStorage.setItem('auth_token', response.token);

        onLogin({
          id: response.user.id,
          name: response.user.name || registerName,
          username: response.user.username,
          avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerUsername}`,
          isAdmin:response.user.isAdmin??false
        });

        setSuccessMessage('注册成功！');
      }

    } catch (error: any) {
      console.error('注册失败:', error);

      // 处理不同的错误情况
      if (error.message.includes('400')) {
        setError('注册信息不完整');
      } else if (error.message.includes('409')) {
        setError('该账号已被注册');
      } else if (error.message.includes('network')) {
        setError('网络连接失败，请检查网络');
      } else {
        setError('注册失败，请稍后再试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              企业通讯平台
            </h1>
            <p className="text-gray-600 mt-2">安全、高效、专业的企业级即时通讯工具</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>欢迎使用</CardTitle>
              <CardDescription>登录或注册您的企业账号</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 错误提示 */}
              {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              {/* 成功提示 */}
              {successMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">账号</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="login-username"
                            type="text"
                            placeholder="请输入账号"
                            className="pl-10"
                            value={loginUsername}
                            onChange={(e) => {
                              setLoginUsername(e.target.value);
                              clearMessages();
                            }}
                            disabled={isLoading}
                            required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              clearMessages();
                            }}
                            disabled={isLoading}
                            required
                        />
                      </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={isLoading}
                    >
                      {isLoading ? '登录中...' : '登录'}
                    </Button>

                    {/* 测试账号提示 */}
                    <div className="text-center text-sm text-gray-500">
                      <p>测试账号：test / 123456</p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">姓名</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="register-name"
                            type="text"
                            placeholder="张三"
                            className="pl-10"
                            value={registerName}
                            onChange={(e) => {
                              setRegisterName(e.target.value);
                              clearMessages();
                            }}
                            disabled={isLoading}
                            required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username">账号</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="register-username"
                            type="text"
                            placeholder="请输入账号（至少3个字符）"
                            className="pl-10"
                            value={registerUsername}
                            onChange={(e) => {
                              setRegisterUsername(e.target.value);
                              clearMessages();
                            }}
                            disabled={isLoading}
                            minLength={3}
                            required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="register-password"
                            type="password"
                            placeholder="请输入密码（至少6位）"
                            className="pl-10"
                            value={registerPassword}
                            onChange={(e) => {
                              setRegisterPassword(e.target.value);
                              clearMessages();
                            }}
                            disabled={isLoading}
                            minLength={6}
                            required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">确认密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="register-confirm-password"
                            type="password"
                            placeholder="请再次输入密码"
                            className="pl-10"
                            value={registerConfirmPassword}
                            onChange={(e) => {
                              setRegisterConfirmPassword(e.target.value);
                              clearMessages();
                            }}
                            disabled={isLoading}
                            minLength={6}
                            required
                        />
                      </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={isLoading}
                    >
                      {isLoading ? '注册中...' : '注册账号'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 企业通讯平台 - 安全可靠的企业级通讯解决方案
        </p>
      </div>
  );
}
