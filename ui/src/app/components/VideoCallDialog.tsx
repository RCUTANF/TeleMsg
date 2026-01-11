import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  Maximize2,
  Settings
} from 'lucide-react';

interface VideoCallDialogProps {
  open: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar: string;
  isVoiceOnly?: boolean;
}

export function VideoCallDialog({ 
  open, 
  onClose, 
  contactName, 
  contactAvatar,
  isVoiceOnly = false 
}: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!open) return;
    
    // 模拟连接
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    // 通话计时
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timer);
      setCallDuration(0);
      setIsConnecting(true);
    };
  }, [open]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallDuration(0);
    setIsConnecting(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-900">
        <div className="relative h-[600px] bg-gradient-to-br from-gray-800 to-gray-900">
          {/* 视频区域 */}
          {!isVoiceOnly && !isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center">
              {/* 模拟视频画面 */}
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-white/10">
                    <AvatarImage src={contactAvatar} alt={contactName} />
                    <AvatarFallback className="text-4xl">{contactName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-white text-xl font-semibold">{contactName}</div>
                  <div className="text-gray-400 mt-2">
                    {isConnecting ? '正在连接...' : formatDuration(callDuration)}
                  </div>
                </div>
              </div>

              {/* 本地视频预览 */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
                  <div className="text-white text-sm">本地视频</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-white/10">
                  <AvatarImage src={contactAvatar} alt={contactName} />
                  <AvatarFallback className="text-4xl">{contactName[0]}</AvatarFallback>
                </Avatar>
                <div className="text-white text-2xl font-semibold mb-2">{contactName}</div>
                <div className="text-gray-400 text-lg">
                  {isConnecting ? '正在连接...' : formatDuration(callDuration)}
                </div>
                {isVoiceOnly && (
                  <div className="mt-4 text-gray-500">语音通话</div>
                )}
              </div>
            </div>
          )}

          {/* 状态信息 */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {isConnecting && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-200 text-sm">正在连接</span>
              </div>
            )}
            {!isConnecting && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-200 text-sm">{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>

          {/* 控制栏 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-full px-6 py-4 shadow-2xl border border-gray-700">
              <div className="flex items-center gap-4">
                {!isVoiceOnly && (
                  <Button
                    size="icon"
                    variant={isVideoOff ? 'destructive' : 'secondary'}
                    className="h-12 w-12 rounded-full"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </Button>
                )}

                <Button
                  size="icon"
                  variant={isMuted ? 'destructive' : 'secondary'}
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                {!isVoiceOnly && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-12 w-12 rounded-full"
                    >
                      <Monitor className="h-5 w-5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-12 w-12 rounded-full"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </Button>
                  </>
                )}

                <Button
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full"
                >
                  <Settings className="h-5 w-5" />
                </Button>

                <div className="w-px h-8 bg-gray-600 mx-2"></div>

                <Button
                  size="icon"
                  variant="destructive"
                  className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          {isMuted && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
              <span className="text-red-200 text-sm flex items-center gap-2">
                <MicOff className="h-4 w-4" />
                您已静音
              </span>
            </div>
          )}

          {isVideoOff && !isVoiceOnly && (
            <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-gray-500/20 border border-gray-500/30 rounded-lg px-4 py-2">
              <span className="text-gray-200 text-sm flex items-center gap-2">
                <VideoOff className="h-4 w-4" />
                摄像头已关闭
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
