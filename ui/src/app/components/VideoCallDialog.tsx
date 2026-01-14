import { useState, useEffect, useRef } from 'react';
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
import { getMediasoupService } from '../services/mediasoup';

interface VideoCallDialogProps {
  open: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar: string;
  contactId: string;
  isVoiceOnly?: boolean;
  callId?: string; // 通话房间ID
}

export function VideoCallDialog({ 
  open, 
  onClose, 
  contactName, 
  contactAvatar,
  contactId,
  isVoiceOnly = false,
  callId
}: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediasoupService = useRef(getMediasoupService('http://localhost:3001'));

  useEffect(() => {
    if (!open) return;
    
    let timer: NodeJS.Timeout;
    let mounted = true;

    // 初始化通话
    const initCall = async () => {
      try {
        const userId = localStorage.getItem('user_id') || 'user_001';
        // 使用传入的callId或生成一个统一的房间ID (按字母序排序确保双方ID一致)
        const roomId = callId || `call_${[userId, contactId].sort().join('_')}`;

        console.log(`🎬 Initializing call: roomId=${roomId}, userId=${userId}, contactId=${contactId}`);

        // 🔥 关键：在加入房间之前先设置回调
        console.log('🔧 Setting up remote stream callback...');
        mediasoupService.current.onRemoteStream((remoteUserId, stream) => {
          console.log(`📺 Remote stream received from user: ${remoteUserId}`);
          console.log(`📊 Stream has ${stream.getTracks().length} tracks:`,
            stream.getTracks().map(t => `${t.kind} (${t.id})`));

          if (remoteVideoRef.current) {
            console.log('✅ Setting remote video srcObject');
            remoteVideoRef.current.srcObject = stream;
            setHasRemoteVideo(true);

            // 确保视频播放
            remoteVideoRef.current.play().catch(err => {
              console.error('❌ Failed to play remote video:', err);
            });
          } else {
            console.warn('⚠️ Remote video ref is null!');
          }
        });

        // 加入房间
        await mediasoupService.current.joinRoom(roomId, userId);

        // 设置状态回调
        mediasoupService.current.onConnectionStateChange((state) => {
          console.log(`🔌 Connection state changed: ${state}`);
          if (state === 'connected') {
            setIsConnecting(false);
          } else if (state === 'disconnected') {
            setIsConnecting(true);
          }
        });

        // 开始发送媒体流
        console.log('🎥 Starting to produce local media...');
        const localStream = await mediasoupService.current.startProducing(
          true, // audio
          !isVoiceOnly // video
        );

        // 设置本地视频
        if (localVideoRef.current && localStream) {
          console.log('✅ Setting local video srcObject');
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(err => {
            console.error('❌ Failed to play local video:', err);
          });
        }

        setIsConnecting(false);

        // 开始计时
        timer = setInterval(() => {
          if (mounted) {
            setCallDuration(prev => prev + 1);
          }
        }, 1000);

      } catch (error) {
        console.error('❌ Failed to initialize call:', error);
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      mounted = false;
      clearInterval(timer);
      mediasoupService.current.leaveRoom();
      setCallDuration(0);
      setIsConnecting(true);
      setIsMuted(false);
      setIsVideoOff(false);
      setHasRemoteVideo(false);
    };
  }, [open, contactId, isVoiceOnly, callId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    mediasoupService.current.toggleAudio(!newMuted);
  };

  const handleToggleVideo = () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    mediasoupService.current.toggleVideo(!newVideoOff);
  };

  const handleEndCall = async () => {
    await mediasoupService.current.leaveRoom();
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
            <div className="w-full h-full flex items-center justify-center relative">
              {/* 远程视频 */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: hasRemoteVideo ? 'block' : 'none' }}
              />

              {/* 等待远程视频的占位符 */}
              {!hasRemoteVideo && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-white/10">
                      <AvatarImage src={contactAvatar} alt={contactName} />
                      <AvatarFallback className="text-4xl">{contactName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-white text-xl font-semibold">{contactName}</div>
                    <div className="text-gray-400 mt-2">等待对方的视频...</div>
                  </div>
                </div>
              )}

              {/* 本地视频预览 */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
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
                    onClick={handleToggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </Button>
                )}

                <Button
                  size="icon"
                  variant={isMuted ? 'destructive' : 'secondary'}
                  className="h-12 w-12 rounded-full"
                  onClick={handleToggleMute}
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
